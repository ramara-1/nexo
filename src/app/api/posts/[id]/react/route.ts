import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { isReactionKind, REACTIONS } from "@/lib/catalog";
import { notify } from "@/lib/notify";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { id } = await context.params;
  const payload = (await request.json()) as { kind?: string };
  const kind = payload.kind ?? "";
  if (!isReactionKind(kind)) {
    return NextResponse.json({ error: "Reconhecimento inválido." }, { status: 400 });
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Publicação não encontrada." }, { status: 404 });
  }

  const existing = await prisma.reaction.findUnique({
    where: { userId_postId_kind: { userId: session.id, postId: id, kind } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { userId: session.id, postId: id, kind },
    });
    await notify({
      userId: post.authorId,
      actorId: session.id,
      type: `react_${kind}`,
      postId: id,
    });
  }

  const rows = await prisma.reaction.findMany({ where: { postId: id } });
  const reactions: Record<string, number> = {};
  for (const item of REACTIONS) reactions[item.id] = 0;
  const mine: string[] = [];
  for (const row of rows) {
    reactions[row.kind] = (reactions[row.kind] ?? 0) + 1;
    if (row.userId === session.id) mine.push(row.kind);
  }
  return NextResponse.json({ reactions, mine });
}
