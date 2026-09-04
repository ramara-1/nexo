import { prisma } from "@/lib/prisma";
import { readSession } from "@/lib/auth";
import { publicUser, type PublicUser } from "@/lib/serialize";

export async function liveUser(): Promise<PublicUser | null> {
  const session = await readSession();
  if (!session) return null;
  try {
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) return null;
    return publicUser({ ...user, onboardingDone: user.onboardingDone });
  } catch {
    return null;
  }
}
