"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { timeAgo } from "@/lib/time";
import type { FeedComment, FeedPost, PublicUser } from "@/lib/serialize";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [me, setMe] = useState<PublicUser | null>(null);
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch(`/api/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else {
          setPost(data.post);
          setComments(data.comments);
        }
      });
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setMe(data.user));
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    const form = new FormData();
    form.set("body", body);
    if (file) form.set("file", file);
    const res = await fetch(`/api/posts/${id}/comments`, { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setComments((list) => [...list, data.comment]);
    setPost((current) =>
      current ? { ...current, commentCount: current.commentCount + 1 } : current,
    );
    setBody("");
    setFile(null);
    setError("");
  }

  async function resolve() {
    const res = await fetch(`/api/posts/${id}/resolve`, { method: "POST" });
    const data = await res.json();
    if (res.ok && post) setPost({ ...post, helpResolved: data.helpResolved });
  }

  async function helpful(commentId: string) {
    await fetch(`/api/posts/${id}/comments/${commentId}/helpful`, { method: "POST" });
    load();
  }

  async function share() {
    if (!post) return;
    const handle = window.prompt("Compartilhar no privado com @ de quem?");
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
    form.set("body", "Olha esta publicação");
    form.set("sharedPostId", post.id);
    await fetch("/api/messages", { method: "POST", body: form });
    window.location.href = `/conversas/${conv.id}`;
  }

  if (!post && !error) return <p className="px-5 py-10 text-sm text-mute">Abrindo…</p>;
  if (error && !post) return <p className="px-5 py-10 text-mute">{error}</p>;
  if (!post) return null;

  const mine = me?.id === post.author.id;

  return (
    <main>
      <header className="flex items-center justify-between border-b border-line px-5 py-4">
        <Link href="/home" className="text-sm text-mute hover:text-cream">
          ← Voltar
        </Link>
        <button type="button" onClick={share} className="text-sm text-mute hover:text-cream">
          Compartilhar
        </button>
      </header>
      <PostCard post={post} onChange={setPost} />
      {post.kind === "help" && mine ? (
        <div className="border-b border-line px-5 py-3">
          <button type="button" onClick={resolve} className="rounded-full bg-ember/20 px-4 py-2 text-sm">
            {post.helpResolved ? "Reabrir problema" : "✅ Marcar problema resolvido"}
          </button>
        </div>
      ) : null}
      <form onSubmit={send} className="border-b border-line px-5 py-4">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={post.kind === "help" ? "Sugerir uma solução" : "Responder"}
          rows={2}
          className="w-full resize-none bg-transparent text-cream outline-none placeholder:text-mute"
        />
        <div className="mt-2 flex items-center gap-3">
          <label className="cursor-pointer text-sm text-mute">
            Arquivo
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          {file ? <span className="text-xs text-mute">{file.name}</span> : null}
          <button
            type="submit"
            disabled={!body.trim()}
          className="ml-auto rounded-full bg-ember px-4 py-1.5 text-sm font-medium text-white disabled:opacity-40"
          >
            Enviar
          </button>
        </div>
        {error ? <p className="mt-2 text-sm text-ember">{error}</p> : null}
      </form>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id} className="flex gap-3 border-b border-line px-5 py-4">
            <Link href={`/u/${comment.author.handle}`}>
              <Avatar user={comment.author} size={32} />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm">
                <Link href={`/u/${comment.author.handle}`} className="font-medium hover:underline">
                  {comment.author.name}
                </Link>
                <span className="text-mute"> · {timeAgo(comment.createdAt)}</span>
                {comment.markedHelpful ? (
                  <span className="ml-2 text-xs text-ember">🤝 Esta ajuda fez diferença</span>
                ) : null}
              </p>
              <p className="mt-1 leading-6 text-cream/90">{comment.body}</p>
              {comment.fileUrl ? (
                <a href={comment.fileUrl} className="mt-1 inline-block text-sm text-mute underline">
                  {comment.fileName ?? "arquivo"}
                </a>
              ) : null}
              {mine && post.kind === "help" ? (
                <button
                  type="button"
                  onClick={() => helpful(comment.id)}
                  className="mt-2 text-xs text-mute hover:text-cream"
                >
                  Reconhecer esta ajuda
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
