import type { Comment, Post, Project, User } from "@prisma/client";
import { REACTIONS } from "@/lib/catalog";
import { parsePrivacy } from "@/lib/access";

export type PublicUser = {
  id: string;
  handle: string;
  name: string;
  avatarHue: number;
  avatarUrl: string | null;
  onboardingDone?: boolean;
};

export function publicUser(
  user: Pick<User, "id" | "handle" | "name" | "avatarHue" | "avatarUrl"> & {
    onboardingDone?: boolean;
  },
): PublicUser {
  return {
    id: user.id,
    handle: user.handle,
    name: user.name,
    avatarHue: user.avatarHue,
    avatarUrl: user.avatarUrl,
    onboardingDone: user.onboardingDone ?? false,
  };
}

export type FeedPost = {
  id: string;
  body: string;
  kind: string;
  visibility: string;
  location: string | null;
  mediaUrl: string | null;
  mediaKind: string | null;
  fileName: string | null;
  helpResolved: boolean;
  createdAt: string;
  author: PublicUser;
  project: { id: string; title: string; status: string } | null;
  commentCount: number;
  reactions: Record<string, number>;
  mine: string[];
};

export function serializePost(
  post: Post & {
    author: Pick<User, "id" | "handle" | "name" | "avatarHue" | "avatarUrl">;
    project: Pick<Project, "id" | "title" | "status"> | null;
    _count: { comments: number };
    reactions: { kind: string; userId: string }[];
  },
  viewerId?: string,
): FeedPost {
  const reactions: Record<string, number> = {};
  for (const item of REACTIONS) reactions[item.id] = 0;
  const mine: string[] = [];
  for (const row of post.reactions) {
    reactions[row.kind] = (reactions[row.kind] ?? 0) + 1;
    if (viewerId && row.userId === viewerId) mine.push(row.kind);
  }
  return {
    id: post.id,
    body: post.body,
    kind: post.kind,
    visibility: post.visibility,
    location: post.location,
    mediaUrl: post.mediaUrl,
    mediaKind: post.mediaKind,
    fileName: post.fileName,
    helpResolved: post.helpResolved,
    createdAt: post.createdAt.toISOString(),
    author: publicUser(post.author),
    project: post.project,
    commentCount: post._count.comments,
    reactions,
    mine,
  };
}

export type FeedComment = {
  id: string;
  body: string;
  fileUrl: string | null;
  fileName: string | null;
  markedHelpful: boolean;
  createdAt: string;
  author: PublicUser;
};

export function serializeComment(
  comment: Comment & {
    user: Pick<User, "id" | "handle" | "name" | "avatarHue" | "avatarUrl">;
  },
): FeedComment {
  return {
    id: comment.id,
    body: comment.body,
    fileUrl: comment.fileUrl,
    fileName: comment.fileName,
    markedHelpful: comment.markedHelpful,
    createdAt: comment.createdAt.toISOString(),
    author: publicUser(comment.user),
  };
}

export function serializeProject(project: Project) {
  return {
    id: project.id,
    title: project.title,
    status: project.status,
    visibility: project.visibility,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function serializeSpace(
  user: User,
  extras: {
    isSelf: boolean;
    following: boolean;
    stats: { ideas: number; helped: number; done: number };
  },
) {
  return {
    user: publicUser(user),
    bio: user.bio,
    thinking: user.thinking,
    doing: user.doing,
    learning: user.learning,
    helpOffering: user.helpOffering,
    helpSeeking: user.helpSeeking,
    privacy: parsePrivacy(user.spacePrivacy),
    isSelf: extras.isSelf,
    following: extras.following,
    stats: extras.stats,
  };
}
