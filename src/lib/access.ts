import { prisma } from "@/lib/prisma";
import { DEFAULT_PRIVACY, type SpaceField, type Visibility } from "@/lib/catalog";

export function parsePrivacy(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Partial<Record<SpaceField, Visibility>>;
    return { ...DEFAULT_PRIVACY, ...parsed };
  } catch {
    return DEFAULT_PRIVACY;
  }
}

export function canSeeContent(
  visibility: string,
  authorId: string,
  viewerId: string | null,
  isFollower: boolean,
) {
  if (visibility === "public") return true;
  if (!viewerId) return false;
  if (authorId === viewerId) return true;
  if (visibility === "followers") return isFollower;
  return false;
}

export async function relation(viewerId: string, otherId: string) {
  const [follow, blockedByMe, blockedMe, muted] = await Promise.all([
    prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId: viewerId, followingId: otherId },
      },
    }),
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: viewerId, blockedId: otherId } },
    }),
    prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: otherId, blockedId: viewerId } },
    }),
    prisma.mute.findUnique({
      where: { muterId_mutedId: { muterId: viewerId, mutedId: otherId } },
    }),
  ]);
  return {
    following: Boolean(follow),
    blocked: Boolean(blockedByMe || blockedMe),
    muted: Boolean(muted),
  };
}

export async function blockedIds(viewerId: string) {
  const [out, incoming] = await Promise.all([
    prisma.block.findMany({ where: { blockerId: viewerId }, select: { blockedId: true } }),
    prisma.block.findMany({ where: { blockedId: viewerId }, select: { blockerId: true } }),
  ]);
  return new Set([...out.map((r) => r.blockedId), ...incoming.map((r) => r.blockerId)]);
}

export async function mutedIds(viewerId: string) {
  const rows = await prisma.mute.findMany({
    where: { muterId: viewerId },
    select: { mutedId: true },
  });
  return new Set(rows.map((r) => r.mutedId));
}

export async function followingIds(viewerId: string) {
  const rows = await prisma.follow.findMany({
    where: { followerId: viewerId },
    select: { followingId: true },
  });
  return new Set(rows.map((r) => r.followingId));
}
