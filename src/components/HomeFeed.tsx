"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PostCard } from "@/components/PostCard";
import { FEED_TABS } from "@/lib/catalog";
import type { FeedPost } from "@/lib/serialize";

const shortcuts = [
  { href: "/criar?tipo=idea", emoji: "💡", label: "Compartilhar ideia" },
  { href: "/criar?tipo=building", emoji: "🔨", label: "Mostrar o que estou fazendo" },
  { href: "/criar?tipo=help", emoji: "🆘", label: "Pedir ajuda" },
  { href: "/criar?tipo=learning", emoji: "📚", label: "Compartilhar aprendizado" },
  { href: "/criar?tipo=achievement", emoji: "✅", label: "Mostrar conquista" },
];

function FeedInner() {
  const params = useSearchParams();
  const initial = params.get("tab") ?? "for-you";
  const [tab, setTab] = useState(initial);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTab(initial);
  }, [initial]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/posts?tab=${tab}`)
      .then(async (res) => {
        if (!res.ok) return { posts: [] };
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPosts(data.posts ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  return (
    <main className="space-y-4">
      <section className="card overflow-hidden bg-gradient-to-r from-[#f3e8ff] via-white to-[#ece9ff] p-6 md:p-8">
        <p className="max-w-md text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
          Não mostre apenas quem você é.
          <span className="mt-1 block text-ember">Mostre o que você está se tornando.</span>
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {["Ideia", "Em construção", "Concluído"].map((step, i) => (
            <span key={step} className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-mute shadow-sm">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-ember text-[11px] text-white">
                {i + 1}
              </span>
              {step}
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold">O que você quer fazer?</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {shortcuts.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="card flex flex-col items-start gap-3 p-4 text-sm font-medium hover:border-ember/40"
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-soft text-lg">{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FEED_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm ${
              tab === item.id ? "bg-ember text-white" : "bg-white text-mute hover:text-cream"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="px-1 py-8 text-sm text-mute">Abrindo o fio…</p>
      ) : posts.length === 0 ? (
        <div className="card p-8 text-sm leading-7 text-mute">
          Ainda está quieto. Compartilhe uma ideia, ou explore quem está construindo algo parecido.
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onChange={(next) =>
                setPosts((list) => list.map((item) => (item.id === next.id ? next : item)))
              }
            />
          ))}
        </div>
      )}
    </main>
  );
}

export function HomeFeed() {
  return (
    <Suspense>
      <FeedInner />
    </Suspense>
  );
}
