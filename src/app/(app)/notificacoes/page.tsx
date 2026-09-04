"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/time";
import type { PublicUser } from "@/lib/serialize";

type Item = {
  id: string;
  type: string;
  createdAt: string;
  actor: PublicUser;
  postId: string | null;
  conversationId: string | null;
  postPreview: string | null;
};

const labels: Record<string, string> = {
  follow: "começou a acompanhar sua jornada",
  comment: "respondeu você",
  helped: "ofereceu ajuda",
  recognized: "reconheceu sua ajuda",
  message: "enviou uma mensagem",
  project_done: "concluiu um projeto",
  react_idea: "achou uma boa ideia",
  react_helped: "reconheceu que ajudou",
  react_congrats: "mandou parabéns",
  react_like: "gostou",
  react_inspiring: "achou inspirador",
};

export default function NotificacoesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setItems(data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="card overflow-hidden">
      <header className="px-5 py-5">
        <h1 className="text-2xl font-semibold tracking-tight">Alertas</h1>
      </header>
      {loading ? (
        <p className="px-5 py-10 text-sm text-mute">Abrindo…</p>
      ) : items.length === 0 ? (
        <p className="px-5 py-10 text-sm text-mute">Nada novo por enquanto.</p>
      ) : (
        <ul>
          {items.map((item) => {
            const href = item.conversationId
              ? `/conversas/${item.conversationId}`
              : item.postId
                ? `/post/${item.postId}`
                : `/u/${item.actor.handle}`;
            return (
              <li key={item.id} className="border-b border-line px-5 py-4">
                <Link href={href} className="flex gap-3">
                  <Avatar user={item.actor} size={36} />
                  <span>
                    <span className="block text-sm leading-6">
                      <strong>{item.actor.name}</strong> {labels[item.type] ?? item.type}
                      {item.postPreview ? `: ${item.postPreview}` : ""}
                    </span>
                    <span className="text-xs text-mute">{timeAgo(item.createdAt)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
