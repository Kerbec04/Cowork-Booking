import Link from "next/link";

import { SignupForm } from "@/components/forms/SignupForm";

export default function CadastroPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <h1 className="text-center text-2xl font-bold text-primary">Criar conta</h1>
      <SignupForm />
      <p className="text-center text-sm text-foreground-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary underline">
          Entrar
        </Link>
      </p>
    </main>
  );
}
