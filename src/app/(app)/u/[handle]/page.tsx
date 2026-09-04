"use client";

import { SpaceView } from "@/components/SpaceView";
import { useParams } from "next/navigation";

export default function ProfilePage() {
  const { handle } = useParams<{ handle: string }>();
  return <SpaceView handle={handle} />;
}
