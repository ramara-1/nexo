import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { parsePrivacy, relation, canSeeContent } from "@/lib/access";
import { publicUser, serializeProject, serializeSpace } from "@/lib/serialize";
import { notify } from "@/lib/notify";
import type { SpaceField, Visibility } from "@/lib/catalog";

export async function GET(
  _request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { handle } = await context.params;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user) {
    return NextResponse.json({ error: "Pessoa não encontrada." }, { status: 404 });
  }

  const rel = await relation(session.id, user.id);
  if (rel.blocked) {
    return NextResponse.json({ error: "Pessoa não encontrada." }, { status: 404 });
  }

  const isSelf = session.id === user.id;
  const privacy = parsePrivacy(user.spacePrivacy);

  const [ideas, helped, done] = await Promise.all([
    prisma.post.count({ where: { authorId: user.id, kind: "idea" } }),
    prisma.comment.count({ where: { userId: user.id, markedHelpful: true } }),
    prisma.project.count({ where: { authorId: user.id, status: "done" } }),
  ]);

  const space = serializeSpace(user, {
    isSelf,
    following: rel.following,
    stats: { ideas, helped, done },
  });

  if (!isSelf) {
    const hide = (field: SpaceField, value: string) =>
      canSeeContent(privacy[field], user.id, session.id, rel.following) ? value : "";
    space.bio = hide("bio", user.bio);
    space.thinking = hide("thinking", user.thinking);
    space.doing = hide("doing", user.doing);
    space.learning = hide("learning", user.learning);
    space.helpOffering = hide("helpOffering", user.helpOffering);
    space.helpSeeking = hide("helpSeeking", user.helpSeeking);
  }

  const projects = await prisma.project.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
  });
  const visibleProjects = projects.filter(
    (p) => isSelf || canSeeContent(p.visibility, user.id, session.id, rel.following),
  );

  return NextResponse.json({
    ...space,
    user: publicUser(user),
    muted: rel.muted,
    projects: visibleProjects.map(serializeProject),
    visible: {
      projects: isSelf || canSeeContent(privacy.projects, user.id, session.id, rel.following),
      ideas: isSelf || canSeeContent(privacy.ideas, user.id, session.id, rel.following),
      achievements:
        isSelf || canSeeContent(privacy.achievements, user.id, session.id, rel.following),
    },
  });
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { handle } = await context.params;
  const user = await prisma.user.findUnique({
    where: { handle: handle.toLowerCase() },
  });
  if (!user || user.id === session.id) {
    return NextResponse.json({ error: "Não dá para seguir esta conta." }, { status: 400 });
  }
  const rel = await relation(session.id, user.id);
  if (rel.blocked) {
    return NextResponse.json({ error: "Não dá para seguir esta conta." }, { status: 400 });
  }

  if (rel.following) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId: session.id, followingId: user.id },
      },
    });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({
    data: { followerId: session.id, followingId: user.id },
  });
  await notify({ userId: user.id, actorId: session.id, type: "follow" });
  return NextResponse.json({ following: true });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ handle: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { handle } = await context.params;
  const me = await prisma.user.findUnique({ where: { id: session.id } });
  if (!me || me.handle !== handle.toLowerCase()) {
    return NextResponse.json({ error: "Só você edita o seu espaço." }, { status: 403 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  for (const key of ["bio", "thinking", "doing", "learning", "helpOffering", "helpSeeking", "name"]) {
    if (typeof body[key] === "string") data[key] = body[key];
  }
  if (body.privacy && typeof body.privacy === "object") {
    data.spacePrivacy = JSON.stringify(body.privacy);
  }
  if (typeof body.onboardingDone === "boolean") {
    data.onboardingDone = body.onboardingDone;
  }

  const user = await prisma.user.update({
    where: { id: session.id },
    data,
  });
  return NextResponse.json({ ok: true, handle: user.handle });
}
