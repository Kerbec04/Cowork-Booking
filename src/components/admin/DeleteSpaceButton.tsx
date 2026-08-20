"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/backend/actions/admin";

type DeleteAction = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

export function DeleteSpaceButton({ action }: { action: DeleteAction }) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Tem certeza que deseja excluir este espaço?")) e.preventDefault();
      }}
      className="flex flex-col items-end gap-1"
    >
      <button type="submit" disabled={pending} className="text-sm text-red-700 hover:underline disabled:opacity-50">
        {pending ? "Excluindo..." : "Excluir"}
      </button>
      {state?.error && <p className="max-w-40 text-right text-xs text-red-700">{state.error}</p>}
    </form>
  );
}
