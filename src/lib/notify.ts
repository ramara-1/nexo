import { prisma } from "@/lib/prisma";

export async function notify(input: {
  userId: string;
  actorId: string;
  type: string;
  postId?: string;
  conversationId?: string;
}) {
  if (input.userId === input.actorId) return;
  await prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId,
      type: input.type,
      postId: input.postId,
      conversationId: input.conversationId,
    },
  });
}
