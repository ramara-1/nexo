import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { notify } from "@/lib/notify";
import { serializeComment } from "@/lib/serialize";
import { saveUpload } from "@/lib/upload";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const { id } = await context.params;
  const form = await request.formData();
  const text = String(form.get("body") ?? "").trim();
  const file = form.get("file");

  if (text.length < 1 || text.length > 500) {
    return NextResponse.json(
      { error: "A resposta precisa ter entre 1 e 500 caracteres." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Publicação não encontrada." }, { status: 404 });
  }

  let fileUrl: string | null = null;
  let fileName: string | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUpload(file);
    fileUrl = saved.url;
    fileName = saved.fileName;
  }

  const comment = await prisma.comment.create({
    data: { body: text, userId: session.id, postId: id, fileUrl, fileName },
    include: { user: true },
  });

  await notify({
    userId: post.authorId,
    actorId: session.id,
    type: post.kind === "help" ? "helped" : "comment",
    postId: id,
  });

  return NextResponse.json({ comment: serializeComment(comment) });
}
