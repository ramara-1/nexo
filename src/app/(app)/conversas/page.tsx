"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { timeAgo } from "@/lib/time";
import type { PublicUser } from "@/lib/serialize";

type Row = {
  id: string;
  other: PublicUser;
  last: { body: string; createdAt: string; fileName: string | null } | null;
};

export default function ConversasPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [people, setPeople] = useState<PublicUser[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then(async (res) => (res.ok ? res.json() : { conversations: [], people: [] }))
      .then((data) => {
        setRows(data.conversations ?? []);
        setPeople(data.people ?? []);
      });
  }, []);

  async function start(handle: string) {
    setBusy(handle);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    const data = await res.json();
    setBusy(null);
    if (res.ok) router.push(`/conversas/${data.id}`);
  }

  return (
    <main className="card overflow-hidden">
      <header className="flex items-start justify-between gap-3 px-5 py-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Conversas</h1>
          <p className="mt-1 text-sm text-mute">
            Fale com quem você acompanha: combine uma ajuda, tire uma dúvida, compartilhe o projeto.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 rounded-full bg-ember px-4 py-2 text-sm font-medium text-white"
        >
          Nova conversa
        </button>
      </header>

      {open ? (
        <section className="border-y border-line bg-paper px-5 py-4">
          <p className="text-sm font-medium">Escolha alguém</p>
          <ul className="mt-3 space-y-2">
            {people.map((person) => (
              <li key={person.id} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2">
                  <Avatar user={person} size={36} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.name}</span>
                    <span className="text-xs text-mute">@{person.handle}</span>
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy === person.handle}
                  onClick={() => start(person.handle)}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-ember"
                >
                  {busy === person.handle ? "Abrindo…" : "Conversar"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {rows.length === 0 && !open ? (
        <p className="px-5 py-10 text-sm text-mute">
          Ainda não há conversas. Toque em <strong>Nova conversa</strong> e escolha um amigo.
        </p>
      ) : (
        <ul>
          {rows.map((row) => (
            <li key={row.id} className="border-b border-line last:border-0">
              <Link href={`/conversas/${row.id}`} className="flex gap-3 px-5 py-4 hover:bg-paper">
                <Avatar user={row.other} />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2">
                    <span className="font-medium">{row.other.name}</span>
                    {row.last ? (
                      <span className="text-xs text-mute">{timeAgo(row.last.createdAt)}</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-mute">
                    {row.last?.body || row.last?.fileName || "Nova conversa"}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
