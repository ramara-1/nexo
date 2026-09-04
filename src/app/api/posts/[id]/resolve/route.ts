import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { notify } from "@/lib/notify";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { id } = await context.params;
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post || post.authorId !== session.id) {
    return NextResponse.json({ error: "Só quem pediu ajuda pode marcar como resolvido." }, { status: 403 });
  }
  if (post.kind !== "help") {
    return NextResponse.json({ error: "Isso não é um pedido de ajuda." }, { status: 400 });
  }

  const updated = await prisma.post.update({
    where: { id },
    data: { helpResolved: !post.helpResolved },
  });
  return NextResponse.json({ helpResolved: updated.helpResolved });
}
