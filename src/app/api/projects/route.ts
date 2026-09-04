import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { isVisibility } from "@/lib/catalog";
import { serializeProject } from "@/lib/serialize";
import { notify } from "@/lib/notify";
import { canSeeContent, relation } from "@/lib/access";
import { postInclude } from "@/lib/postsQuery";
import { serializePost } from "@/lib/serialize";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    const mine = await prisma.project.findMany({
      where: { authorId: session.id },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ projects: mine.map(serializeProject) });
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      author: true,
      posts: {
        orderBy: { createdAt: "asc" },
        include: postInclude,
      },
    },
  });
  if (!project) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
  }
  const rel = await relation(session.id, project.authorId);
  if (
    !canSeeContent(project.visibility, project.authorId, session.id, rel.following)
  ) {
    return NextResponse.json({ error: "Este projeto não está visível." }, { status: 403 });
  }

  return NextResponse.json({
    project: serializeProject(project),
    author: {
      handle: project.author.handle,
      name: project.author.name,
      avatarHue: project.author.avatarHue,
      avatarUrl: project.author.avatarUrl,
      id: project.author.id,
    },
    isSelf: project.authorId === session.id,
    posts: project.posts.map((post) => serializePost(post, session.id)),
  });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const body = (await request.json()) as {
    title?: string;
    visibility?: string;
    status?: string;
    id?: string;
  };
  if (body.id && body.status) {
    const project = await prisma.project.findFirst({
      where: { id: body.id, authorId: session.id },
    });
    if (!project) {
      return NextResponse.json({ error: "Projeto não encontrado." }, { status: 404 });
    }
    const updated = await prisma.project.update({
      where: { id: project.id },
      data: { status: body.status },
    });
    if (body.status === "done" && project.status !== "done") {
      const followers = await prisma.follow.findMany({
        where: { followingId: session.id },
        select: { followerId: true },
      });
      await Promise.all(
        followers.map((row) =>
          notify({ userId: row.followerId, actorId: session.id, type: "project_done" }),
        ),
      );
    }
    return NextResponse.json({ project: serializeProject(updated) });
  }

  const title = body.title?.trim() ?? "";
  const visibility = body.visibility ?? "public";
  if (title.length < 2) {
    return NextResponse.json({ error: "Dê um nome ao projeto." }, { status: 400 });
  }
  if (!isVisibility(visibility)) {
    return NextResponse.json({ error: "Privacidade inválida." }, { status: 400 });
  }
  const project = await prisma.project.create({
    data: { title, visibility, authorId: session.id, status: body.status ?? "idea" },
  });
  return NextResponse.json({ project: serializeProject(project) });
}
