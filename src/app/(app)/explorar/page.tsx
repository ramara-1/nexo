"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PostCard } from "@/components/PostCard";
import type { FeedPost, PublicUser } from "@/lib/serialize";

type ProjectHit = {
  id: string;
  title: string;
  status: string;
  author: PublicUser;
};

export default function ExplorarPage() {
  return (
    <Suspense>
      <ExplorarInner />
    </Suspense>
  );
}

function ExplorarInner() {
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [people, setPeople] = useState<PublicUser[]>([]);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [projects, setProjects] = useState<ProjectHit[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((res) => res.json())
        .then((data) => {
          setPeople(data.people ?? []);
          setPosts(data.posts ?? []);
          setProjects(data.projects ?? []);
        });
    }, 180);
    return () => clearTimeout(timer);
  }, [q]);

  return (
    <main className="space-y-4">
      <header className="card p-5">
        <h1 className="text-xl font-semibold tracking-tight">Explorar</h1>
        <p className="mt-1 text-sm text-mute">Pessoas, ideias, projetos, problemas, soluções.</p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ex.: aplicativo de manutenção"
          className="mt-3 w-full rounded-xl border border-line bg-panel px-3 py-2.5 text-cream outline-none placeholder:text-mute"
        />
        <Link href="/criar?tipo=help" className="mt-3 inline-block text-sm text-ember">
          🆘 Ver e pedir ajuda
        </Link>
      </header>
      {people.length ? (
        <section className="card overflow-hidden">
          <h2 className="px-5 pt-4 text-xs uppercase tracking-wider text-mute">Pessoas</h2>
          <ul>
            {people.map((person) => (
              <li key={person.id}>
                <Link href={`/u/${person.handle}`} className="flex items-center gap-3 px-5 py-3 hover:bg-cream/3">
                  <Avatar user={person} />
                  <span>
                    <span className="block text-cream">{person.name}</span>
                    <span className="text-sm text-mute">@{person.handle}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {projects.length ? (
        <section className="card p-4">
          <h2 className="text-xs uppercase tracking-wider text-mute">Projetos</h2>
          <ul className="mt-2 space-y-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projeto/${p.id}`} className="block rounded-xl border border-line px-3 py-2">
                  <span className="text-cream">{p.title}</span>
                  <span className="block text-xs text-mute">
                    {p.author.name} · {p.status === "done" ? "concluído" : p.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {posts.length ? (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onChange={(next) => setPosts((list) => list.map((item) => (item.id === next.id ? next : item)))}
            />
          ))}
        </div>
      ) : null}
    </main>
  );
}
