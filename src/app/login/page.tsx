import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { liveUser } from "@/lib/sessionUser";

export default async function LoginPage() {
  if (await liveUser()) redirect("/home");

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
      <Link href="/" className="flex items-center gap-2 font-semibold">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-ember text-white">✦</span>
        Nexo
      </Link>
      <div className="card mt-8 p-6">
        <h1 className="text-3xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="mt-2 text-mute">Retome a ideia, o projeto, a ajuda.</p>
        <AuthForm mode="login" />
      </div>
      <p className="mt-6 text-sm text-mute">
        Novo por aqui?{" "}
        <Link href="/cadastro" className="font-medium text-ember">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
