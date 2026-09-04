import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSession } from "@/lib/auth";
import { publicUser } from "@/lib/serialize";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    handle?: string;
    email?: string;
    password?: string;
  };

  const name = body.name?.trim() ?? "";
  const handle = body.handle?.trim().toLowerCase().replace(/^@/, "") ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (name.length < 2) {
    return NextResponse.json({ error: "Nome muito curto." }, { status: 400 });
  }
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    return NextResponse.json(
      { error: "O @ precisa ter 3–20 caracteres: letras, números ou _." },
      { status: 400 },
    );
  }
  if (!email.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "A senha precisa de pelo menos 6 caracteres." },
      { status: 400 },
    );
  }

  const taken = await prisma.user.findFirst({
    where: { OR: [{ email }, { handle }] },
  });
  if (taken) {
    return NextResponse.json(
      { error: "E-mail ou @ já está em uso." },
      { status: 409 },
    );
  }

  const user = await prisma.user.create({
    data: {
      name,
      handle,
      email,
      passwordHash: await bcrypt.hash(password, 10),
      avatarHue: Math.floor(Math.random() * 360),
    },
  });

  const token = await signSession({
    id: user.id,
    handle: user.handle,
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ user: publicUser(user) });
}
