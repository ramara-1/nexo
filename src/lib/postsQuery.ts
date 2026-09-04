import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { blockedIds, canSeeContent, followingIds, mutedIds } from "@/lib/access";
import { serializePost } from "@/lib/serialize";

export const postInclude = {
  author: true,
  project: true,
  _count: { select: { comments: true } },
  reactions: { select: { kind: true, userId: true } },
} satisfies Prisma.PostInclude;

export async function visiblePosts(
  viewerId: string,
  where: Prisma.PostWhereInput,
  take = 50,
) {
  const [blocked, muted, following] = await Promise.all([
    blockedIds(viewerId),
    mutedIds(viewerId),
    followingIds(viewerId),
  ]);
  const hidden = [...blocked, ...muted];

  const posts = await prisma.post.findMany({
    where: {
      AND: [where, hidden.length ? { authorId: { notIn: hidden } } : {}],
    },
    orderBy: { createdAt: "desc" },
    take: take * 2,
    include: postInclude,
  });

  return posts
    .filter((post) =>
      canSeeContent(
        post.visibility,
        post.authorId,
        viewerId,
        following.has(post.authorId) || post.authorId === viewerId,
      ),
    )
    .slice(0, take)
    .map((post) => serializePost(post, viewerId));
}
