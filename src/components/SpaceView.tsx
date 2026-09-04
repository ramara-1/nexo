"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import { SPACE_FIELDS, VISIBILITY, type SpaceField, type Visibility } from "@/lib/catalog";
import type { FeedPost, PublicUser } from "@/lib/serialize";

type Project = { id: string; title: string; status: string };

type Space = {
  user: PublicUser;
  bio: string;
  thinking: string;
  doing: string;
  learning: string;
  helpOffering: string;
  helpSeeking: string;
  privacy: Record<SpaceField, Visibility>;
  isSelf: boolean;
  following: boolean;
  muted?: boolean;
  stats: { ideas: number; helped: number; done: number };
  projects: Project[];
  visible: { projects: boolean; ideas: boolean; achievements: boolean };
};

const statusLabel: Record<string, string> = {
  idea: "Ideia",
  building: "Em construção",
  progress: "Em andamento",
  done: "Concluído",
};

export function SpaceView({ handle }: { handle: string }) {
  const router = useRouter();
  const [space, setSpace] = useState<Space | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  function load() {
    Promise.all([
      fetch(`/api/users/${handle}`).then((res) => res.json()),
      fetch(`/api/posts?handle=${handle}`).then((res) => res.json()),
    ]).then(([userData, postData]) => {
      if (userData.error) {
        setError(userData.error);
        return;
      }
      setSpace(userData);
      setPosts(postData.posts ?? []);
    });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handle]);

  async function follow() {
    const res = await fetch(`/api/users/${handle}`, { method: "POST" });
    const data = await res.json();
    if (res.ok && space) setSpace({ ...space, following: data.following });
  }

  async function moderate(action: "block" | "mute" | "report") {
    const reason = action === "report" ? window.prompt("Por que você está denunciando?") : "";
    if (action === "report" && reason == null) return;
    await fetch("/api/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle, action, reason }),
    });
    if (action === "block") router.push("/home");
    else load();
  }

  async function message() {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle }),
    });
    const data = await res.json();
    if (res.ok) router.push(`/conversas/${data.id}`);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!space) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") ?? space.user.name),
      bio: String(form.get("bio") ?? ""),
      thinking: String(form.get("thinking") ?? ""),
      doing: String(form.get("doing") ?? ""),
      learning: String(form.get("learning") ?? ""),
      helpOffering: String(form.get("helpOffering") ?? ""),
      helpSeeking: String(form.get("helpSeeking") ?? ""),
      privacy: space.privacy,
    };
    await fetch(`/api/users/${handle}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const photo = form.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const fd = new FormData();
      fd.set("file", photo);
      await fetch("/api/me/avatar", { method: "POST", body: fd });
    }
    setEditing(false);
    load();
  }

  if (error) return <p className="px-5 py-10 text-mute">{error}</p>;
  if (!space) return <p className="px-5 py-10 text-sm text-mute">Abrindo o espaço…</p>;

  const ideas = posts.filter((p) => p.kind === "idea");
  const wins = posts.filter((p) => p.kind === "achievement" || p.kind === "done");

  return (
    <main className="space-y-4 pb-6">
      <header className="card px-5 py-8">
        <p className="text-xs uppercase tracking-[0.18em] text-ember">Meu Espaço</p>
        <div className="mt-4 flex items-start gap-4">
          <Avatar user={space.user} size={76} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl tracking-tight">{space.user.name}</h1>
            <p className="text-mute">@{space.user.handle}</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-mute">
              <span>
                <strong className="text-cream">{space.stats.ideas}</strong> ideias
              </span>
              <span>
                <strong className="text-cream">{space.stats.done}</strong> projetos concluídos
              </span>
              <span>
                Você ajudou <strong className="text-cream">{space.stats.helped}</strong>{" "}
                {space.stats.helped === 1 ? "pessoa" : "pessoas"}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {space.isSelf ? (
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="rounded-full border border-line px-4 py-2 text-sm"
            >
              {editing ? "Cancelar" : "Editar espaço"}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={follow}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  space.following ? "border border-line bg-white" : "bg-ember text-white"
                }`}
              >
                {space.following ? "Acompanhando" : "Acompanhar jornada"}
              </button>
              <button type="button" onClick={message} className="rounded-full border border-line px-4 py-2 text-sm">
                Conversar
              </button>
              <button type="button" onClick={() => moderate("mute")} className="text-sm text-mute">
                {space.muted ? "Ouvir de novo" : "Silenciar"}
              </button>
              <button type="button" onClick={() => moderate("block")} className="text-sm text-mute">
                Bloquear
              </button>
              <button type="button" onClick={() => moderate("report")} className="text-sm text-mute">
                Denunciar
              </button>
            </>
          )}
        </div>
      </header>

      {editing ? (
        <form onSubmit={save} className="card space-y-3 px-5 py-5">
          <input name="name" defaultValue={space.user.name} className="field" />
          <label className="text-sm text-mute">
            Foto de perfil
            <input name="photo" type="file" accept="image/*" className="mt-1 block text-cream" />
          </label>
          {(
            [
              ["bio", "Biografia"],
              ["thinking", "O que estou pensando"],
              ["doing", "O que estou fazendo"],
              ["learning", "O que estou aprendendo"],
              ["helpOffering", "Ajuda que ofereço"],
              ["helpSeeking", "Ajuda que estou procurando"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm text-mute">
              {label}
              <textarea name={key} defaultValue={space[key]} rows={2} className="field mt-1" />
            </label>
          ))}
          <p className="text-sm text-cream">Privacidade de cada parte</p>
          {SPACE_FIELDS.map((field) => (
            <label key={field.id} className="flex items-center justify-between gap-3 text-sm">
              {field.label}
              <select
                value={space.privacy[field.id]}
                onChange={(e) =>
                  setSpace({
                    ...space,
                    privacy: { ...space.privacy, [field.id]: e.target.value as Visibility },
                  })
                }
                className="rounded-lg border border-line bg-ink px-2 py-1"
              >
                {VISIBILITY.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.emoji} {v.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button type="submit" className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white">
            Salvar espaço
          </button>
        </form>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2">
          <Card title="Biografia" text={space.bio} />
          <Card title="O que estou pensando" text={space.thinking} />
          <Card title="O que estou fazendo" text={space.doing} />
          <Card title="O que estou aprendendo" text={space.learning} />
          <Card title="Ajuda que ofereço" text={space.helpOffering} />
          <Card title="Ajuda que procuro" text={space.helpSeeking} />
        </section>
      )}

      {space.visible.projects ? (
        <section className="card px-5 py-5">
          <h2 className="text-xl font-semibold">Meus projetos</h2>
          {space.projects.length === 0 ? (
            <p className="mt-2 text-sm text-mute">Nenhuma jornada ainda.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {space.projects.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projeto/${p.id}`}
                    className="flex items-center justify-between rounded-2xl border border-line px-4 py-3 hover:border-ember/40"
                  >
                    <span>{p.title}</span>
                    <span className="text-xs text-mute">
                      {p.status === "done" ? "🎉 Concluído" : statusLabel[p.status] ?? p.status}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {space.visible.ideas && ideas.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Ideias</h2>
          {ideas.map((post) => (
            <PostCard key={post.id} post={post} onChange={(n) => setPosts((l) => l.map((i) => (i.id === n.id ? n : i)))} />
          ))}
        </section>
      ) : null}

      {space.visible.achievements && wins.length ? (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">Conquistas</h2>
          {wins.map((post) => (
            <PostCard key={post.id} post={post} onChange={(n) => setPosts((l) => l.map((i) => (i.id === n.id ? n : i)))} />
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">O fio</h2>
        {posts
          .filter((p) => p.kind !== "idea" && p.kind !== "achievement" && p.kind !== "done")
          .map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onChange={(next) => setPosts((list) => list.map((item) => (item.id === next.id ? next : item)))}
          />
        ))}
      </section>
    </main>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  if (!text) return null;
  return (
    <div className="rounded-2xl border border-line bg-panel px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-mute">{title}</p>
      <p className="mt-1 leading-6 text-cream/90">{text}</p>
    </div>
  );
}
