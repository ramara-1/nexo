"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/Avatar";
import { kindMeta, REACTIONS } from "@/lib/catalog";
import { badgeClass, progressOf } from "@/lib/progress";
import { timeAgo } from "@/lib/time";
import type { FeedPost } from "@/lib/serialize";

export function PostCard({
  post,
  onChange,
}: {
  post: FeedPost;
  onChange?: (next: FeedPost) => void;
}) {
  const router = useRouter();
  const meta = kindMeta(post.kind);
  const tags = post.body.match(/#[\p{L}\d_]+/gu) ?? [];

  async function react(kind: string) {
    const res = await fetch(`/api/posts/${post.id}/react`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    const data = await res.json();
    if (!res.ok) return;
    onChange?.({ ...post, reactions: data.reactions, mine: data.mine });
  }

  const helped = post.reactions.helped ?? 0;
  const pct = progressOf(post.project?.status);

  return (
    <article className="card animate-rise p-5">
      <div className="flex gap-3">
        <Link href={`/u/${post.author.handle}`} className="mt-0.5">
          <Avatar user={post.author} />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <Link href={`/u/${post.author.handle}`} className="font-semibold hover:underline">
                {post.author.name}
              </Link>
              <p className="text-xs text-mute">
                @{post.author.handle} · {timeAgo(post.createdAt)}
              </p>
            </div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClass(post.kind)}`}>
              {meta.label}
            </span>
          </div>
          {post.project ? (
            <Link href={`/projeto/${post.project.id}`} className="mt-3 block font-medium text-cream">
              {post.project.title}
            </Link>
          ) : null}
          <Link href={`/post/${post.id}`} className="mt-2 block">
            <p className="whitespace-pre-wrap text-[0.95rem] leading-7 text-cream/90">{post.body}</p>
            {tags.length ? (
              <p className="mt-2 space-x-2 text-sm text-ember">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            ) : null}
            {post.location ? <p className="mt-2 text-xs text-mute">📍 {post.location}</p> : null}
            {post.mediaKind === "image" && post.mediaUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.mediaUrl} alt="" className="mt-3 max-h-[360px] w-full rounded-2xl object-cover" />
            ) : null}
            {post.mediaKind === "video" && post.mediaUrl ? (
              <video src={post.mediaUrl} controls className="mt-3 w-full rounded-2xl" />
            ) : null}
            {post.mediaKind === "file" && post.mediaUrl ? (
              <span className="mt-3 inline-flex rounded-xl border border-line px-3 py-2 text-sm text-mute">
                📎 {post.fileName ?? "arquivo"}
              </span>
            ) : null}
          </Link>
          {post.project ? (
            <div className="mt-3">
              <div className="h-2 overflow-hidden rounded-full bg-brand-soft">
                <div className="h-full rounded-full bg-ember" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-1 text-xs text-mute">{pct}% da jornada</p>
            </div>
          ) : null}
          {post.helpResolved ? (
            <p className="mt-2 text-xs font-medium text-ok">Problema resolvido</p>
          ) : null}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {REACTIONS.map((item) => {
              const on = post.mine.includes(item.id);
              const count = post.reactions[item.id] ?? 0;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => react(item.id)}
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    on ? "bg-brand-soft text-ember" : "bg-paper text-mute hover:text-cream"
                  }`}
                  title={item.label}
                >
                  {item.emoji} {count || ""}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => router.push(`/post/${post.id}`)}
              className="rounded-full bg-paper px-2.5 py-1 text-xs text-mute"
            >
              💬 {post.commentCount || ""}
            </button>
            {helped ? (
              <span className="ml-auto text-xs text-mute">Ajudou {helped} {helped === 1 ? "pessoa" : "pessoas"}</span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
