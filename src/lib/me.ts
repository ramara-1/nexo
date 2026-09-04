import { redirect } from "next/navigation";
import { liveUser } from "@/lib/sessionUser";
import type { PublicUser } from "@/lib/serialize";

export async function getMe(): Promise<PublicUser> {
  const user = await liveUser();
  if (!user) redirect("/login");
  return user;
}
