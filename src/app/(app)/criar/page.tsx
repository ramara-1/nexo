"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { CreateForm } from "@/components/CreateForm";
import { isPostKind } from "@/lib/catalog";
import { Suspense } from "react";

function Inner() {
  const params = useSearchParams();
  const router = useRouter();
  const tipo = params.get("tipo") ?? "idea";
  const kind = isPostKind(tipo) ? tipo : "idea";

  return (
    <main className="card">
      <header className="px-5 py-6">
        <h1 className="text-2xl font-semibold tracking-tight">Criar</h1>
        <p className="mt-1 text-sm text-mute">Mostre o que está nascendo — não só o que já ficou pronto.</p>
      </header>
      <CreateForm
        key={kind}
        initialKind={kind}
        onCreated={() => router.push("/home")}
      />
    </main>
  );
}

export default function CriarPage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
