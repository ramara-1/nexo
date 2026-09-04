"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const steps = [
  {
    title: "Este não é apenas um lugar para mostrar o que você fez.",
    text: "É um lugar para mostrar o que você está tentando fazer.",
  },
  {
    title: "Compartilhe sua ideia.",
    text: "Mesmo crua. Mesmo incompleta. Ideia também é caminho.",
  },
  {
    title: "Mostre sua evolução.",
    text: "Uma jornada: ideia, construção, andamento, concluído.",
  },
  {
    title: "Peça ajuda. Ajude alguém.",
    text: "E quando conseguir, comemore — sem transformar isso em ranking.",
  },
];

export function Onboarding({ handle }: { handle: string }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const step = steps[index];

  async function finish() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/users/${handle}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingDone: true }),
      });
    } finally {
      localStorage.setItem("nexo-onboarding-done", "1");
      router.refresh();
      window.location.assign("/home");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md animate-rise rounded-3xl border border-line bg-panel p-7">
        <p className="text-xs uppercase tracking-[0.18em] text-ember">Nexo</p>
        <h2 className="mt-3 font-display text-2xl leading-snug tracking-tight">{step.title}</h2>
        <p className="mt-3 leading-7 text-mute">{step.text}</p>
        <div className="mt-6 flex items-center justify-between">
          <span className="text-xs text-mute">
            {index + 1} / {steps.length}
          </span>
          {index < steps.length - 1 ? (
            <button
              type="button"
              onClick={() => setIndex((n) => n + 1)}
              className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white"
            >
              Continuar
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white"
            >
              {busy ? "Entrando…" : "Entrar no meu espaço"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
