"use client";

import { useActionState } from "react";

import { changePasswordAction } from "@/backend/actions/user";
import { Button } from "@/components/Button";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={formAction} key={state?.success ? "reset" : "form"} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="senhaAtual" className="text-sm font-medium">
          Senha atual
        </label>
        <input
          id="senhaAtual"
          name="senhaAtual"
          type="password"
          required
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="novaSenha" className="text-sm font-medium">
          Nova senha
        </label>
        <input
          id="novaSenha"
          name="novaSenha"
          type="password"
          required
          minLength={8}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Senha alterada.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Alterando..." : "Alterar senha"}
      </Button>
    </form>
  );
}
