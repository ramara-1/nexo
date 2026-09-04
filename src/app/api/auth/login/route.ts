import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie, signSession } from "@/lib/auth";
import { publicUser } from "@/lib/serialize";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
  };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Conta não encontrada." }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const token = await signSession({
    id: user.id,
    handle: user.handle,
    name: user.name,
  });
  await setSessionCookie(token);

  return NextResponse.json({ user: publicUser(user) });
}
