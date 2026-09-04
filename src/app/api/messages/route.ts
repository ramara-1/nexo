import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { relation } from "@/lib/access";
import { notify } from "@/lib/notify";
import { publicUser } from "@/lib/serialize";
import { saveUpload } from "@/lib/upload";

function pair(a: string, b: string) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

export async function GET(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");

  if (!id) {
    const [rows, follows] = await Promise.all([
      prisma.conversation.findMany({
        where: { OR: [{ userAId: session.id }, { userBId: session.id }] },
        include: {
          userA: true,
          userB: true,
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.follow.findMany({
        where: { OR: [{ followerId: session.id }, { followingId: session.id }] },
        include: { follower: true, following: true },
      }),
    ]);
    const peopleMap = new Map<string, ReturnType<typeof publicUser>>();
    for (const row of follows) {
      const other = row.followerId === session.id ? row.following : row.follower;
      if (other.id !== session.id) peopleMap.set(other.id, publicUser(other));
    }
    const extra = await prisma.user.findMany({
      where: { id: { not: session.id } },
      take: 12,
    });
    for (const person of extra) peopleMap.set(person.id, publicUser(person));

    return NextResponse.json({
      conversations: rows.map((row) => {
        const other = row.userAId === session.id ? row.userB : row.userA;
        const last = row.messages[0];
        return {
          id: row.id,
          other: publicUser(other),
          last: last
            ? { body: last.body, createdAt: last.createdAt.toISOString(), fileName: last.fileName }
            : null,
        };
      }),
      people: [...peopleMap.values()],
    });
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      OR: [{ userAId: session.id }, { userBId: session.id }],
    },
    include: {
      userA: true,
      userB: true,
      messages: { orderBy: { createdAt: "asc" }, take: 200 },
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }
  const other =
    conversation.userAId === session.id ? conversation.userB : conversation.userA;
  return NextResponse.json({
    conversation: {
      id: conversation.id,
      other: publicUser(other),
      messages: conversation.messages.map((m) => ({
        id: m.id,
        body: m.body,
        mediaUrl: m.mediaUrl,
        fileName: m.fileName,
        sharedPostId: m.sharedPostId,
        sharedProjectId: m.sharedProjectId,
        mine: m.senderId === session.id,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { handle?: string };
    const other = await prisma.user.findUnique({
      where: { handle: (body.handle ?? "").toLowerCase() },
    });
    if (!other || other.id === session.id) {
      return NextResponse.json({ error: "Pessoa inválida." }, { status: 400 });
    }
    const rel = await relation(session.id, other.id);
    if (rel.blocked) {
      return NextResponse.json({ error: "Não é possível conversar." }, { status: 403 });
    }
    const ids = pair(session.id, other.id);
    const conversation = await prisma.conversation.upsert({
      where: { userAId_userBId: ids },
      update: {},
      create: ids,
    });
    return NextResponse.json({ id: conversation.id });
  }

  const form = await request.formData();
  const conversationId = String(form.get("conversationId") ?? "");
  const text = String(form.get("body") ?? "").trim();
  const sharedPostId = String(form.get("sharedPostId") ?? "").trim() || null;
  const sharedProjectId = String(form.get("sharedProjectId") ?? "").trim() || null;
  const file = form.get("file");

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ userAId: session.id }, { userBId: session.id }],
    },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada." }, { status: 404 });
  }

  let mediaUrl: string | null = null;
  let fileName: string | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    mediaUrl = saved.url;
    fileName = saved.fileName;
  }

  if (!text && !mediaUrl && !sharedPostId && !sharedProjectId) {
    return NextResponse.json({ error: "Escreva algo ou envie um arquivo." }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      body: text,
      mediaUrl,
      fileName,
      senderId: session.id,
      conversationId,
      sharedPostId,
      sharedProjectId,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  const otherId =
    conversation.userAId === session.id ? conversation.userBId : conversation.userAId;
  await notify({
    userId: otherId,
    actorId: session.id,
    type: "message",
    conversationId,
  });

  return NextResponse.json({
    message: {
      id: message.id,
      body: message.body,
      mediaUrl: message.mediaUrl,
      fileName: message.fileName,
      sharedPostId: message.sharedPostId,
      sharedProjectId: message.sharedProjectId,
      mine: true,
      createdAt: message.createdAt.toISOString(),
    },
  });
}
