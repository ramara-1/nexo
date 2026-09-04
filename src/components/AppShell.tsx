"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Avatar } from "@/components/Avatar";
import { Logo } from "@/components/Logo";
import { Onboarding } from "@/components/Onboarding";
import { RightRail } from "@/components/RightRail";
import type { PublicUser } from "@/lib/serialize";

const primary = [
  { href: "/home", label: "Início", icon: "⌂" },
  { href: "/explorar", label: "Explorar", icon: "⌕" },
  { href: "/home?tab=projects", label: "Projetos", icon: "▦" },
  { href: "/home?tab=learning", label: "Aprendizados", icon: "▤" },
  { href: "/home?tab=help", label: "Preciso de ajuda", icon: "!" },
  { href: "/home?tab=achievement", label: "Conquistas", icon: "✓" },
];

const secondary = [
  { href: "/conversas", label: "Conversas" },
  { href: "/notificacoes", label: "Notificações" },
  { href: "/espaco", label: "Meu Espaço" },
];

const dock = [
  { href: "/home", label: "Início", icon: "⌂" },
  { href: "/explorar", label: "Explorar", icon: "⌕" },
  { href: "/criar", label: "Criar", icon: "+" },
  { href: "/conversas", label: "Conversas", icon: "💬" },
  { href: "/espaco", label: "Espaço", icon: "👤" },
];

export function AppShell({
  me,
  children,
}: {
  me: PublicUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const feedTab = searchParams.get("tab");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const skipped = localStorage.getItem("nexo-onboarding-done") === "1";
    setShowOnboarding(!me.onboardingDone && !skipped);
  }, [me.onboardingDone]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  function search(event: FormEvent) {
    event.preventDefault();
    router.push(`/explorar?q=${encodeURIComponent(q)}`);
  }

  function active(href: string) {
    const [path, query] = href.split("?");
    const tab = query?.replace("tab=", "");
    if (path === "/espaco") return pathname === "/espaco" || pathname.startsWith("/u/");
    if (path === "/conversas") return pathname.startsWith("/conversas");
    if (path === "/criar") return pathname.startsWith("/criar");
    if (path === "/home" && tab) return pathname === "/home" && feedTab === tab;
    if (path === "/home") return pathname === "/home" && !feedTab;
    return pathname === path;
  }

  return (
    <div className="min-h-full bg-paper pb-24">
      {showOnboarding ? <Onboarding handle={me.handle} /> : null}

      <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
          <Logo />
          <form onSubmit={search} className="mx-auto hidden max-w-xl flex-1 md:block">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar ideias, projetos, pessoas..."
              className="w-full rounded-full border border-line bg-paper px-4 py-2.5 text-sm outline-none placeholder:text-mute focus:border-ember"
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/notificacoes" className="grid h-10 w-10 place-items-center rounded-full bg-paper text-mute">
              🔔
            </Link>
            <Link href="/espaco">
              <Avatar user={me} size={36} />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-5">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-56 shrink-0 flex-col justify-between lg:flex">
          <nav className="space-y-1">
            {primary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  active(link.href) ? "bg-brand-soft font-medium text-ember" : "text-mute hover:bg-white hover:text-cream"
                }`}
              >
                <span className="w-5 text-center">{link.icon}</span>
                {link.label}
              </Link>
            ))}
            <div className="my-3 h-px bg-line" />
            {secondary.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${
                  active(link.href) ? "bg-brand-soft font-medium text-ember" : "text-mute hover:bg-white hover:text-cream"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button type="button" onClick={logout} className="px-3 py-2 text-left text-sm text-mute hover:text-cream">
              Sair
            </button>
          </nav>
          <div className="card p-4">
            <p className="text-sm font-semibold">Qual é a sua ideia hoje?</p>
            <p className="mt-1 text-xs leading-5 text-mute">Mostre o que está nascendo, mesmo incompleto.</p>
            <Link
              href="/criar"
              className="mt-3 block rounded-full bg-ember py-2 text-center text-sm font-medium text-white"
            >
              Criar publicação
            </Link>
          </div>
        </aside>

        <div className="min-w-0 flex-1">{children}</div>
        <RightRail me={me} />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-end justify-around px-2 py-2">
          {dock.map((link) =>
            link.href === "/criar" ? (
              <Link
                key={link.href}
                href="/criar"
                className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-ember text-2xl text-white shadow-lg shadow-ember/40"
                aria-label="Criar"
              >
                +
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] ${
                  active(link.href) ? "text-ember" : "text-mute"
                }`}
              >
                <span className="text-lg leading-none">{link.icon}</span>
                {link.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </div>
  );
}
