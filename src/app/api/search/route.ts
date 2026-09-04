import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { blockedIds } from "@/lib/access";
import { publicUser } from "@/lib/serialize";
import { visiblePosts } from "@/lib/postsQuery";
import { canSeeContent, followingIds } from "@/lib/access";
import { like } from "@/lib/like";

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  const hidden = await blockedIds(session.id);

  if (q.length < 1) {
    const people = await prisma.user.findMany({
      where: { id: { notIn: [session.id, ...hidden] } },
      take: 16,
    });
    return NextResponse.json({ people: people.map(publicUser), posts: [], projects: [] });
  }

  const [people, posts, projectsRaw, following] = await Promise.all([
    prisma.user.findMany({
      where: {
        AND: [
          { id: { notIn: [...hidden] } },
          {
            OR: [
              { handle: { contains: q.toLowerCase() } },
              { name: like(q) },
              { doing: like(q) },
              { learning: like(q) },
              { helpOffering: like(q) },
            ],
          },
        ],
      },
      take: 12,
    }),
    visiblePosts(session.id, {
      OR: [{ body: like(q) }, { location: like(q) }],
    }, 12),
    prisma.project.findMany({
      where: { title: like(q) },
      take: 12,
      include: { author: true },
    }),
    followingIds(session.id),
  ]);

  const projects = projectsRaw
    .filter(
      (p) =>
        !hidden.has(p.authorId) &&
        canSeeContent(p.visibility, p.authorId, session.id, following.has(p.authorId)),
    )
    .map((p) => ({
      ...serializeProject(p),
      author: publicUser(p.author),
    }));

  return NextResponse.json({
    people: people.map(publicUser),
    posts,
    projects,
  });
}
