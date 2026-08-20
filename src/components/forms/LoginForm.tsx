"use client";

import { useActionState } from "react";

import { googleSignInAction, loginAction } from "@/backend/actions/auth";
import { Button } from "@/components/Button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
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

        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}

        <Button type="submit" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <form action={googleSignInAction}>
        <Button type="submit" variant="outline" className="w-full">
          Entrar com Google
        </Button>
      </form>
    </div>
  );
}
