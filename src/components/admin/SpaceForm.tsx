"use client";

import { useActionState } from "react";

import type { AdminActionState } from "@/backend/actions/admin";
import { SPACE_TYPE_LABELS } from "@/backend/lib/constants";
import type { Space } from "@/generated/prisma/client";
import { Button } from "@/components/Button";

type SpaceFormAction = (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;

// Prisma's Decimal type isn't a plain object and can't cross the Server →
// Client Component boundary, so callers pass these fields as plain numbers.
type SpaceFormValues = Omit<Space, "precoHora" | "precoAddonPodcastHora"> & {
  precoHora: number;
  precoAddonPodcastHora: number | null;
};

export function SpaceForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: SpaceFormAction;
  initialValues?: SpaceFormValues;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

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
          defaultValue={initialValues?.nome}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tipo" className="text-sm font-medium">
          Tipo
        </label>
        <select
          id="tipo"
          name="tipo"
          required
          defaultValue={initialValues?.tipo ?? "SALA_REUNIAO"}
          className="rounded-md border border-border px-3 py-2"
        >
          {Object.entries(SPACE_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="capacidade" className="text-sm font-medium">
            Capacidade
          </label>
          <input
            id="capacidade"
            name="capacidade"
            type="number"
            min={1}
            required
            defaultValue={initialValues?.capacidade}
            className="rounded-md border border-border px-3 py-2"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="precoHora" className="text-sm font-medium">
            Preço/hora cheio (R$)
          </label>
          <input
            id="precoHora"
            name="precoHora"
            type="number"
            min={0}
            step="0.01"
            required
            defaultValue={initialValues ? Number(initialValues.precoHora) : undefined}
            className="rounded-md border border-border px-3 py-2"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="descontoPrimeiraReserva" className="text-sm font-medium">
          Desconto de primeira reserva (%)
        </label>
        <input
          id="descontoPrimeiraReserva"
          name="descontoPrimeiraReserva"
          type="number"
          min={0}
          max={100}
          defaultValue={initialValues?.descontoPrimeiraReserva ?? 0}
          className="rounded-md border border-border px-3 py-2"
        />
        <p className="text-xs text-foreground-muted">
          Aplicado só na primeira reserva não cancelada de cada cliente (qualquer espaço), sobre o
          preço cheio e sobre o addon de podcast, se houver. 0 = sem desconto de boas-vindas.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2 rounded-md border border-border p-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="possuiAddonPodcast"
            defaultChecked={initialValues?.possuiAddonPodcast ?? false}
          />
          Este espaço tem opção de addon de podcast
        </label>
        <div className="flex flex-col gap-1">
          <label htmlFor="precoAddonPodcastHora" className="text-sm font-medium">
            Preço do addon/hora cheio (R$)
          </label>
          <input
            id="precoAddonPodcastHora"
            name="precoAddonPodcastHora"
            type="number"
            min={0}
            step="0.01"
            defaultValue={initialValues?.precoAddonPodcastHora ?? undefined}
            className="rounded-md border border-border px-3 py-2"
          />
        </div>
      </fieldset>

      <div className="flex flex-col gap-1">
        <label htmlFor="descricao" className="text-sm font-medium">
          Descrição
        </label>
        <textarea
          id="descricao"
          name="descricao"
          rows={3}
          defaultValue={initialValues?.descricao ?? undefined}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fotos" className="text-sm font-medium">
          Fotos (uma URL por linha)
        </label>
        <textarea
          id="fotos"
          name="fotos"
          rows={3}
          defaultValue={initialValues?.fotos.join("\n")}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="regrasUso" className="text-sm font-medium">
          Regras de uso
        </label>
        <textarea
          id="regrasUso"
          name="regrasUso"
          rows={2}
          defaultValue={initialValues?.regrasUso ?? undefined}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="ativo"
          defaultChecked={initialValues?.ativo ?? true}
        />
        Ativo (visível na listagem pública)
      </label>

      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-700">Salvo com sucesso.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
