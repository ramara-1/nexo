"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { PROJECT_STEPS } from "@/lib/catalog";
import type { FeedPost, PublicUser } from "@/lib/serialize";

export default function ProjetoPage() {
  const { id } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("idea");
  const [author, setAuthor] = useState<PublicUser | null>(null);
  const [isSelf, setIsSelf] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects?id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setTitle(data.project.title);
          setStatus(data.project.status);
          setAuthor(data.author);
          setIsSelf(data.isSelf);
          setPosts(data.posts);
        }
      });
  }, [id]);

  async function share() {
    const handle = window.prompt("Compartilhar este projeto com @ de quem?");
    if (!handle) return;
    const opened = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: handle.replace(/^@/, "") }),
    });
    const conv = await opened.json();
    if (!opened.ok) return;
    const form = new FormData();
    form.set("conversationId", conv.id);
    form.set("body", `Projeto: ${title}`);
    form.set("sharedProjectId", id);
    await fetch("/api/messages", { method: "POST", body: form });
    window.location.href = `/conversas/${conv.id}`;
  }

  if (error) return <p className="px-5 py-10 text-mute">{error}</p>;
  if (!title) return <p className="px-5 py-10 text-sm text-mute">Abrindo a jornada…</p>;

  return (
    <main className="space-y-4">
      <header className="card px-5 py-8">
        <Link href="/home" className="text-sm text-mute">
          ← Voltar
        </Link>
        {status === "done" ? (
          <p className="mt-4 text-lg">🎉 Projeto concluído</p>
        ) : (
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-ember">jornada</p>
        )}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
        {author ? (
          <Link href={`/u/${author.handle}`} className="mt-1 block text-sm text-mute">
            {author.name}
          </Link>
        ) : null}
        <ol className="mt-6 flex flex-wrap gap-2">
          {PROJECT_STEPS.map((step, index) => {
            const current = PROJECT_STEPS.findIndex((s) => s.id === status);
            const done = index <= current;
            return (
              <li
                key={step.id}
                className={`rounded-full px-3 py-1 text-sm ${done ? "bg-brand-soft text-ember" : "bg-white text-mute"}`}
              >
                {index + 1}. {step.label}
              </li>
            );
          })}
        </ol>
        <div className="mt-4 flex gap-3">
          {isSelf ? (
            <Link href={`/criar?tipo=building`} className="text-sm text-ember">
              Registrar próximo passo
            </Link>
          ) : null}
          <button type="button" onClick={share} className="text-sm text-mute">
            Compartilhar jornada
          </button>
        </div>
      </header>
      <div className="space-y-4">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={(next) => setPosts((list) => list.map((item) => (item.id === next.id ? next : item)))}
        />
      ))}
      </div>
    </main>
  );
}
