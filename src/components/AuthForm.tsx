"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, handle, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Não deu certo.");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 flex flex-col gap-3">
      {mode === "register" ? (
        <>
          <Field label="Nome" value={name} onChange={setName} autoComplete="name" />
          <Field
            label="@"
            value={handle}
            onChange={setHandle}
            autoComplete="username"
            placeholder="seu_nome"
          />
        </>
      ) : null}
      <Field
        label="E-mail"
        type="email"
        value={email}
        onChange={setEmail}
        autoComplete="email"
      />
      <Field
        label="Senha"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <button
        type="submit"
        disabled={busy}
        className="mt-2 rounded-full bg-ember py-3 font-medium text-white disabled:opacity-50"
      >
        {busy ? "Entrando…" : mode === "login" ? "Entrar" : "Criar conta"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-mute">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-cream outline-none placeholder:text-mute/70 focus:border-ember"
      />
    </label>
  );
}
