import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const body = (await request.json()) as {
    handle?: string;
    action?: "block" | "mute" | "report";
    reason?: string;
  };
  const user = await prisma.user.findUnique({
    where: { handle: (body.handle ?? "").toLowerCase() },
  });
  if (!user || user.id === session.id) {
    return NextResponse.json({ error: "Pessoa inválida." }, { status: 400 });
  }

  if (body.action === "block") {
    const existing = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: session.id, blockedId: user.id } },
    });
    if (existing) {
      await prisma.block.delete({
        where: { blockerId_blockedId: { blockerId: session.id, blockedId: user.id } },
      });
      return NextResponse.json({ blocked: false });
    }
    await prisma.block.create({
      data: { blockerId: session.id, blockedId: user.id },
    });
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: session.id, followingId: user.id },
          { followerId: user.id, followingId: session.id },
        ],
      },
    });
    return NextResponse.json({ blocked: true });
  }

  if (body.action === "mute") {
    const existing = await prisma.mute.findUnique({
      where: { muterId_mutedId: { muterId: session.id, mutedId: user.id } },
    });
    if (existing) {
      await prisma.mute.delete({
        where: { muterId_mutedId: { muterId: session.id, mutedId: user.id } },
      });
      return NextResponse.json({ muted: false });
    }
    await prisma.mute.create({
      data: { muterId: session.id, mutedId: user.id },
    });
    return NextResponse.json({ muted: true });
  }

  await prisma.report.create({
    data: {
      reporterId: session.id,
      targetId: user.id,
      reason: (body.reason ?? "sem motivo").slice(0, 300),
    },
  });
  return NextResponse.json({ reported: true });
}
