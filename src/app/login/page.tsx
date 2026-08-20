import Link from "next/link";

import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="text-center text-2xl font-bold text-primary">Entrar</h1>
      <LoginForm />
      <p className="text-center text-sm text-foreground-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="text-primary underline">
          Cadastre-se
        </Link>
      </p>
    </main>
  );
}
