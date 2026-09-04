import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { isPostKind, isVisibility } from "@/lib/catalog";
import { followingIds } from "@/lib/access";
import { postInclude, visiblePosts } from "@/lib/postsQuery";
import { serializePost } from "@/lib/serialize";
import { notify } from "@/lib/notify";
import { like } from "@/lib/like";
import { saveUpload } from "@/lib/upload";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Entre para ver o fio." }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const tab = searchParams.get("tab") ?? "for-you";
  const handle = searchParams.get("handle");
  const q = searchParams.get("q")?.trim() ?? "";
  const helpOnly = searchParams.get("help") === "1";

  const following = await followingIds(session.id);
  let where: Parameters<typeof visiblePosts>[1] = {};

  if (handle) {
    where = { author: { handle: handle.toLowerCase() } };
  } else if (helpOnly || tab === "help") {
    where = { kind: "help" };
  } else if (tab === "idea") where = { kind: "idea" };
  else if (tab === "learning") where = { kind: "learning" };
  else if (tab === "achievement") where = { kind: { in: ["achievement", "done"] } };
  else if (tab === "projects") where = { projectId: { not: null } };
  else if (tab === "for-you") {
    where = { authorId: { in: [...following, session.id] } };
  }

  if (q) {
    where = {
      AND: [
        where,
        {
          OR: [
            { body: like(q) },
            { location: like(q) },
            { project: { title: like(q) } },
          ],
        },
      ],
    };
  }

  const posts = await visiblePosts(session.id, where);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const form = await request.formData();
  const body = String(form.get("body") ?? "").trim();
  const kind = String(form.get("kind") ?? "talk");
  const visibility = String(form.get("visibility") ?? "public");
  const location = String(form.get("location") ?? "").trim() || null;
  const projectId = String(form.get("projectId") ?? "").trim() || null;
  const projectTitle = String(form.get("projectTitle") ?? "").trim();
  const projectStatus = String(form.get("projectStatus") ?? "").trim();
  const file = form.get("file");

  if (!isPostKind(kind)) {
    return NextResponse.json({ error: "Tipo inválido." }, { status: 400 });
  }
  if (!isVisibility(visibility)) {
    return NextResponse.json({ error: "Privacidade inválida." }, { status: 400 });
  }
  if (body.length < 1 || body.length > 2000) {
    return NextResponse.json({ error: "O texto precisa ter entre 1 e 2000 caracteres." }, { status: 400 });
  }

  let mediaUrl: string | null = null;
  let mediaKind: string | null = null;
  let fileName: string | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    mediaUrl = saved.url;
    mediaKind = saved.mediaKind;
    fileName = saved.fileName;
  }

  let resolvedProjectId = projectId;
  if (projectTitle && !projectId) {
    const created = await prisma.project.create({
      data: {
        title: projectTitle,
        status: projectStatus || (kind === "idea" ? "idea" : "building"),
        visibility,
        authorId: session.id,
      },
    });
    resolvedProjectId = created.id;
  }

  if (resolvedProjectId) {
    const project = await prisma.project.findFirst({
      where: { id: resolvedProjectId, authorId: session.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    if (projectStatus) {
      await prisma.project.update({
        where: { id: project.id },
        data: { status: projectStatus },
      });
      if (projectStatus === "done") {
        const followers = await prisma.follow.findMany({
          where: { followingId: session.id },
          select: { followerId: true },
        });
        await Promise.all(
          followers.map((row) =>
            notify({
              userId: row.followerId,
              actorId: session.id,
              type: "project_done",
            }),
          ),
        );
      }
    }
  }

  const post = await prisma.post.create({
    data: {
      body,
      kind,
      visibility,
      location,
      mediaUrl,
      mediaKind,
      fileName,
      authorId: session.id,
      projectId: resolvedProjectId,
    },
    include: postInclude,
  });

  return NextResponse.json({ post: serializePost(post, session.id) });
}
