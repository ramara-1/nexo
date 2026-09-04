import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { publicUser } from "@/lib/serialize";

export async function GET() {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const items = await prisma.notification.findMany({
    where: { userId: session.id },
    include: { actor: true, post: { select: { id: true, body: true, kind: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  await prisma.notification.updateMany({
    where: { userId: session.id, read: false },
    data: { read: true },
  });

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      type: item.type,
      createdAt: item.createdAt.toISOString(),
      actor: publicUser(item.actor),
      postId: item.postId,
      conversationId: item.conversationId,
      postPreview: item.post?.body.slice(0, 90) ?? null,
    })),
  });
}
