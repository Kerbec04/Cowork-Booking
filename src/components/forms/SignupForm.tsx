"use client";

import { useActionState } from "react";

import { signupAction } from "@/backend/actions/auth";
import { Button } from "@/components/Button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome
        </label>
        <input id="nome" name="nome" required className="rounded-md border border-border px-3 py-2" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone <span className="text-foreground-muted">(opcional)</span>
        </label>
        <input id="telefone" name="telefone" className="rounded-md border border-border px-3 py-2" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="senha" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="senha"
          name="senha"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="lgpdConsent" required className="mt-1" />
        <span>
          Li e aceito a Política de Privacidade e autorizo o tratamento dos meus dados
          pessoais para fins de cadastro e reserva.
        </span>
      </label>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
}
