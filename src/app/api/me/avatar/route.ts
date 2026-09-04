import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { publicUser } from "@/lib/serialize";

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) {
    return NextResponse.json({ error: "Faça login." }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Escolha uma foto." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Envie uma imagem." }, { status: 400 });
  }
  const saved = await saveUpload(file);
  const user = await prisma.user.update({
    where: { id: session.id },
    data: { avatarUrl: saved.url },
  });
  return NextResponse.json({ user: publicUser(user) });
}
