import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { liveUser } from "@/lib/sessionUser";

export default async function CadastroPage() {
  if (await liveUser()) redirect("/home");

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-white">✦</span>
        Nexo
      </Link>
      <div className="card mt-8 p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Chegue perto</h1>
        <p className="mt-2 text-mute">Um @, um nome — e um lugar para o que você está construindo.</p>
        <AuthForm mode="register" />
      </div>
      <p className="mt-6 text-sm text-mute">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-ember">
          Entrar
        </Link>
      </p>
    </div>
  );
}
