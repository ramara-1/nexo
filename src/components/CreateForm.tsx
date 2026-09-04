"use client";

import { useEffect, useState } from "react";
import { POST_KINDS, PROJECT_STEPS, VISIBILITY, type PostKind } from "@/lib/catalog";
import type { FeedPost } from "@/lib/serialize";

type ProjectOption = { id: string; title: string; status: string };

export function CreateForm({
  initialKind = "idea",
  onCreated,
}: {
  initialKind?: PostKind;
  onCreated?: (post: FeedPost) => void;
}) {
  const [kind, setKind] = useState<PostKind>(initialKind);
  const [body, setBody] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [file, setFile] = useState<File | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [projectId, setProjectId] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectStatus, setProjectStatus] = useState("idea");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects ?? []));
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData();
    form.set("body", body);
    form.set("kind", kind);
    form.set("visibility", visibility);
    form.set("location", location);
    if (projectId) form.set("projectId", projectId);
    if (!projectId && projectTitle) {
      form.set("projectTitle", projectTitle);
      form.set("projectStatus", projectStatus);
    } else if (projectId && projectStatus) {
      form.set("projectStatus", projectStatus);
    }
    if (file) form.set("file", file);
    try {
      const res = await fetch("/api/posts", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBody("");
      setFile(null);
      setLocation("");
      onCreated?.(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não deu para publicar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 px-5 py-5">
      <div className="flex flex-wrap gap-2">
        {POST_KINDS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              kind === item.id ? "bg-ember text-white" : "bg-paper text-mute hover:text-cream"
            }`}
          >
            {item.emoji} {item.label}
          </button>
        ))}
      </div>
      <p className="text-sm text-mute">{POST_KINDS.find((item) => item.id === kind)?.hint}</p>
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Qual é a sua ideia hoje?"
        rows={6}
        maxLength={2000}
        className="w-full resize-none rounded-2xl border border-line bg-panel px-4 py-3 leading-7 text-cream outline-none placeholder:text-mute"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-mute">
          Ligar a um projeto
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2 text-cream"
          >
            <option value="">Nenhum / criar novo</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        {!projectId ? (
          <label className="text-sm text-mute">
            Novo projeto
            <input
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              placeholder="Ex.: App de manutenção"
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2 text-cream outline-none"
            />
          </label>
        ) : (
          <label className="text-sm text-mute">
            Etapa da jornada
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2 text-cream"
            >
              {PROJECT_STEPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {!projectId && projectTitle ? (
          <label className="text-sm text-mute sm:col-span-2">
            Etapa inicial
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="mt-1 w-full rounded-xl border border-line bg-ink px-3 py-2 text-cream"
            >
              {PROJECT_STEPS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={visibility}
          onChange={(e) => setVisibility(e.target.value)}
          className="rounded-full border border-line bg-ink px-3 py-2 text-sm text-cream"
        >
          {VISIBILITY.map((v) => (
            <option key={v.id} value={v.id}>
              {v.emoji} {v.label}
            </option>
          ))}
        </select>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Local (opcional)"
          className="min-w-0 flex-1 rounded-full border border-line bg-ink px-3 py-2 text-sm text-cream outline-none"
        />
        <label className="cursor-pointer rounded-full border border-line px-3 py-2 text-sm text-mute hover:text-cream">
          Foto, vídeo ou arquivo
          <input
            type="file"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>
      {file ? <p className="text-xs text-mute">{file.name}</p> : null}
      {error ? <p className="text-sm text-ember">{error}</p> : null}
      <button
        type="submit"
        disabled={busy || !body.trim()}
        className="rounded-full bg-ember px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40"
      >
        {busy ? "Publicando…" : "Compartilhar"}
      </button>
    </form>
  );
}
