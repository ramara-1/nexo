"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/Avatar";
import type { PublicUser } from "@/lib/serialize";

type Msg = {
  id: string;
  body: string;
  mediaUrl: string | null;
  fileName: string | null;
  sharedPostId: string | null;
  sharedProjectId: string | null;
  mine: boolean;
  createdAt: string;
};

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const [other, setOther] = useState<PublicUser | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);

  function load() {
    fetch(`/api/messages?id=${id}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.conversation) return;
        setOther(data.conversation.other);
        setMessages(data.conversation.messages);
      });
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 3000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() && !file) return;
    setError("");
    const form = new FormData();
    form.set("conversationId", id);
    form.set("body", body);
    if (file) form.set("file", file);
    const res = await fetch("/api/messages", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Não deu para enviar.");
      return;
    }
    setMessages((list) => [...list, data.message]);
    setBody("");
    setFile(null);
  }

  return (
    <main className="card flex min-h-[70vh] flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-line px-5 py-3">
        <Link href="/conversas" className="text-mute">
          ←
        </Link>
        {other ? (
          <Link href={`/u/${other.handle}`} className="flex items-center gap-2">
            <Avatar user={other} size={36} />
            <span>
              <span className="block font-medium">{other.name}</span>
              <span className="text-xs text-mute">@{other.handle}</span>
            </span>
          </Link>
        ) : (
          <span className="text-sm text-mute">Abrindo conversa…</span>
        )}
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto bg-paper px-5 py-4">
        {messages.length === 0 ? (
          <p className="pt-8 text-center text-sm text-mute">
            Ainda não tem mensagem. Diga oi e conte no que está trabalhando.
          </p>
        ) : null}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-6 ${
              m.mine ? "ml-auto bg-ember text-white" : "bg-white shadow-sm"
            }`}
          >
            {m.body}
            {m.mediaUrl ? (
              m.mediaUrl.match(/\.(png|jpe?g|gif|webp)$/i) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.mediaUrl} alt="" className="mt-2 max-h-48 rounded-lg" />
              ) : (
                <a href={m.mediaUrl} className="mt-1 block underline">
                  {m.fileName ?? "arquivo"}
                </a>
              )
            ) : null}
            {m.sharedPostId ? (
              <Link href={`/post/${m.sharedPostId}`} className="mt-1 block text-xs underline">
                Publicação compartilhada
              </Link>
            ) : null}
            {m.sharedProjectId ? (
              <Link href={`/projeto/${m.sharedProjectId}`} className="mt-1 block text-xs underline">
                Projeto compartilhado
              </Link>
            ) : null}
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="flex flex-col gap-2 border-t border-line px-4 py-3">
        {file ? <p className="text-xs text-mute">Anexo: {file.name}</p> : null}
        {error ? <p className="text-xs text-help">{error}</p> : null}
        <div className="flex gap-2">
          <label className="cursor-pointer self-center rounded-full bg-paper px-3 py-2 text-sm text-mute">
            📎
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escreva uma mensagem"
            className="flex-1 rounded-full border border-line bg-white px-4 py-2 text-sm outline-none"
          />
          <button type="submit" className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white">
            Enviar
          </button>
        </div>
      </form>
    </main>
  );
}
