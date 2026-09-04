import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { serializeComment } from "@/lib/serialize";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string; commentId: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { id, commentId } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== session.id) {
    return NextResponse.json({ error: "Só o autor pode reconhecer a ajuda." }, { status: 403 });
  }

  const comment = await prisma.comment.findFirst({
    where: { id: commentId, postId: id },
    include: { user: true },
  });
  if (!comment) {
    return NextResponse.json({ error: "Resposta não encontrada." }, { status: 404 });
  }

  await prisma.comment.updateMany({
    where: { postId: id },
    data: { markedHelpful: false, helpedUserId: null },
  });

  const next = !comment.markedHelpful;
  const updated = await prisma.comment.update({
    where: { id: comment.id },
    data: {
      markedHelpful: next,
      helpedUserId: next ? comment.userId : null,
    },
    include: { user: true },
  });

  if (next) {
    await prisma.post.update({ where: { id }, data: { helpResolved: true } });
    await notify({
      userId: comment.userId,
      actorId: session.id,
      type: "recognized",
      postId: id,
    });
  }

  return NextResponse.json({ comment: serializeComment(updated) });
}
