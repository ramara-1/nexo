import { AppShell } from "@/components/AppShell";
import { getMe } from "@/lib/me";
import { Suspense } from "react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getMe();
  return (
    <Suspense>
      <AppShell me={me}>{children}</AppShell>
    </Suspense>
  );
}
