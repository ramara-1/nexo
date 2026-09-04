"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { PROJECT_STEPS } from "@/lib/catalog";
import { progressOf } from "@/lib/progress";
import type { PublicUser } from "@/lib/serialize";

type Space = {
  user: PublicUser;
  stats: { ideas: number; helped: number; done: number };
  following: boolean;
  projects: { id: string; title: string; status: string }[];
  helpSeeking: string;
  doing: string;
};

export function RightRail({ me }: { me: PublicUser }) {
  const [space, setSpace] = useState<Space | null>(null);
  const [helpers, setHelpers] = useState<PublicUser[]>([]);
  const [featured, setFeatured] = useState<{ id: string; title: string; status: string }[]>([]);

  useEffect(() => {
    fetch(`/api/users/${me.handle}`)
      .then(async (res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !data.error) setSpace(data);
      });
    fetch("/api/search?q=")
      .then(async (res) => (res.ok ? res.json() : { people: [] }))
      .then((data) => setHelpers((data.people ?? []).slice(0, 3)));
    fetch("/api/posts?tab=projects")
      .then(async (res) => (res.ok ? res.json() : { posts: [] }))
      .then((data) => {
        const seen = new Set<string>();
        const list: { id: string; title: string; status: string }[] = [];
        for (const post of data.posts ?? []) {
          if (post.project && !seen.has(post.project.id)) {
            seen.add(post.project.id);
            list.push(post.project);
          }
        }
        setFeatured(list.slice(0, 3));
      });
  }, [me.handle]);

  const current = space?.projects[0];
  const currentIndex = PROJECT_STEPS.findIndex((s) => s.id === (current?.status ?? "idea"));

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-[300px] shrink-0 flex-col gap-4 overflow-y-auto xl:flex">
      <div className="card p-4">
        <div className="flex items-center gap-3">
          <Avatar user={me} size={48} />
          <div>
            <p className="font-semibold">{space?.user.name ?? me.name}</p>
            <p className="text-sm text-mute">@{me.handle}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 text-center">
          <Stat n={space?.projects.length ?? 0} label="Projetos" />
          <Stat n={space?.stats.done ?? 0} label="Conquistas" />
          <Stat n={space?.stats.helped ?? 0} label="Ajudou" />
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold">Minha jornada</h2>
        <ol className="mt-3 space-y-3">
          {PROJECT_STEPS.map((step, index) => (
            <li key={step.id} className="flex items-center gap-3 text-sm">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs ${
                  index <= currentIndex ? "bg-ember text-white" : "bg-brand-soft text-mute"
                }`}
              >
                {index + 1}
              </span>
              <span className={index <= currentIndex ? "text-cream" : "text-mute"}>{step.label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold">Pessoas que podem te ajudar</h2>
        <ul className="mt-3 space-y-3">
          {helpers.map((person) => (
            <li key={person.id} className="flex items-center justify-between gap-2">
              <Link href={`/u/${person.handle}`} className="flex min-w-0 items-center gap-2">
                <Avatar user={person} size={32} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{person.name}</span>
                  <span className="block truncate text-xs text-mute">@{person.handle}</span>
                </span>
              </Link>
              <Link
                href={`/u/${person.handle}`}
                className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-ember"
              >
                Seguir
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-4">
        <h2 className="text-sm font-semibold">Projetos em destaque</h2>
        <ul className="mt-3 space-y-4">
          {featured.map((p) => (
            <li key={p.id}>
              <Link href={`/projeto/${p.id}`} className="block">
                <p className="truncate text-sm font-medium">{p.title}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-brand-soft">
                  <div className="h-full rounded-full bg-ember" style={{ width: `${progressOf(p.status)}%` }} />
                </div>
                <p className="mt-1 text-xs text-mute">{progressOf(p.status)}%</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div>
      <p className="text-lg font-semibold">{n}</p>
      <p className="text-[11px] text-mute">{label}</p>
    </div>
  );
}
