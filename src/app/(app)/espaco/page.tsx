"use client";

import { SpaceView } from "@/components/SpaceView";
import { useEffect, useState } from "react";

export default function EspacoPage() {
  const [handle, setHandle] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setHandle(data.user?.handle ?? null));
  }, []);
  if (!handle) return <p className="px-5 py-10 text-sm text-mute">Abrindo o seu espaço…</p>;
  return <SpaceView handle={handle} />;
}
