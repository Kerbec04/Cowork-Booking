"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/backend/actions/user";
import { Button } from "@/components/Button";

export function ProfileForm({
  initialValues,
}: {
  initialValues: { nome: string; email: string; telefone: string };
}) {
  const [state, formAction, pending] = useActionState(updateProfileAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="nome" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="nome"
          name="nome"
          required
          defaultValue={initialValues.nome}
          className="rounded-md border border-border px-3 py-2"
        />
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
          defaultValue={initialValues.email}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="telefone" className="text-sm font-medium">
          Telefone <span className="text-foreground-muted">(opcional)</span>
        </label>
        <input
          id="telefone"
          name="telefone"
          defaultValue={initialValues.telefone}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Dados atualizados.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar alterações"}
      </Button>
    </form>
  );
}
