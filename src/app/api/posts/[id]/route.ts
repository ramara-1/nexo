import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { canSeeContent, followingIds, relation } from "@/lib/access";
import { postInclude } from "@/lib/postsQuery";
import { serializeComment, serializePost } from "@/lib/serialize";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { id } = await context.params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      ...postInclude,
      comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!post) {
    return NextResponse.json({ error: "Publicação não encontrada." }, { status: 404 });
  }
  const rel = await relation(session.id, post.authorId);
  if (rel.blocked) {
    return NextResponse.json({ error: "Publicação não encontrada." }, { status: 404 });
  }
  const following = await followingIds(session.id);
  if (
    !canSeeContent(
      post.visibility,
      post.authorId,
      session.id,
      following.has(post.authorId),
    )
  ) {
    return NextResponse.json({ error: "Este conteúdo não está visível para você." }, { status: 403 });
  }

  return NextResponse.json({
    post: serializePost(post, session.id),
    comments: post.comments.map(serializeComment),
  });
}
