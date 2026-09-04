import Link from "next/link";
import { redirect } from "next/navigation";
import { liveUser } from "@/lib/sessionUser";

export default async function LandingPage() {
  if (await liveUser()) redirect("/home");

  return (
    <div className="relative min-h-full overflow-hidden bg-paper">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-ember/10 blur-3xl" />
      <div className="mx-auto flex min-h-full max-w-5xl flex-col justify-between px-6 py-10">
        <header className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-white">✦</span>
            Nexo
          </span>
          <Link href="/login" className="text-sm text-mute hover:text-cream">
            Entrar
          </Link>
        </header>
        <main className="max-w-xl py-20">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ember">ideias · evolução · ajuda</p>
          <h1 className="mt-4 text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Não mostre apenas quem você é.
            <span className="mt-2 block text-ember">Mostre o que você está se tornando.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-8 text-mute">
            Uma rede para compartilhar não apenas momentos, mas também ideias, caminhos e
            conquistas.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/cadastro" className="rounded-full bg-ember px-6 py-3 font-medium text-white">
              Começar minha jornada
            </Link>
            <Link href="/login" className="rounded-full border border-line bg-white px-6 py-3">
              Já tenho conta
            </Link>
          </div>
          <p className="mt-8 text-sm text-mute">
            Demo: <span className="text-cream">marina@nexo.social</span> · senha nexo123
          </p>
        </main>
        <footer className="text-xs text-mute">Nexo · ideias + pessoas + evolução + ajuda</footer>
      </div>
    </div>
  );
}
