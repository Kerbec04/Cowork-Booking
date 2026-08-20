"use client";

import { useActionState, useEffect, useState, useTransition } from "react";

import { createBookingAction, getAvailabilityAction } from "@/backend/actions/bookings";
import { todayInSaoPaulo } from "@/backend/lib/date";
import { precoComDesconto } from "@/backend/lib/pricing";
import { Button } from "@/components/Button";

type Slot = { hour: number; disponivel: boolean };

export function BookingWidget({
  spaceId,
  precoHora,
  descontoAplicavel,
  possuiAddonPodcast,
  precoAddonPodcastHora,
}: {
  spaceId: string;
  precoHora: number;
  descontoAplicavel: number;
  possuiAddonPodcast: boolean;
  precoAddonPodcastHora: number | null;
}) {
  const [data, setData] = useState(todayInSaoPaulo());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, startLoadingTransition] = useTransition();
  const [horaInicio, setHoraInicio] = useState<number | null>(null);
  const [duracao, setDuracao] = useState(1);
  const [podcastIncluido, setPodcastIncluido] = useState(false);
  const [state, formAction, pending] = useActionState(createBookingAction, undefined);

  const precoBase = precoComDesconto(precoHora, descontoAplicavel);
  const precoAddon =
    possuiAddonPodcast && precoAddonPodcastHora
      ? precoComDesconto(precoAddonPodcastHora, descontoAplicavel)
      : 0;

  useEffect(() => {
    let ignore = false;
    startLoadingTransition(async () => {
      const s = await getAvailabilityAction(spaceId, data);
      if (!ignore) {
        setSlots(s);
        setHoraInicio(null);
        setPodcastIncluido(false);
      }
    });
    // refetch after a successful booking so the just-taken slot shows as busy
    return () => {
      ignore = true;
    };
  }, [spaceId, data, state?.success]);

  const valorEstimado =
    horaInicio !== null ? (precoBase + (podcastIncluido ? precoAddon : 0)) * duracao : null;

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-white p-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="data" className="text-sm font-medium">
          Data
        </label>
        <input
          id="data"
          type="date"
          min={todayInSaoPaulo()}
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="rounded-md border border-border px-3 py-2"
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Horário de início</p>
        {loading ? (
          <p className="text-sm text-foreground-muted">Carregando horários...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-foreground-muted">Espaço fechado nesse dia.</p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button
                key={slot.hour}
                type="button"
                disabled={!slot.disponivel}
                onClick={() => setHoraInicio(slot.hour)}
                className={`rounded-md border px-2 py-1.5 text-sm ${
                  horaInicio === slot.hour
                    ? "border-primary bg-primary text-white"
                    : slot.disponivel
                      ? "border-border hover:border-primary"
                      : "border-border bg-background-muted text-foreground-muted line-through"
                }`}
              >
                {String(slot.hour).padStart(2, "0")}:00
              </button>
            ))}
          </div>
        )}
      </div>

      {horaInicio !== null && (
        <div className="flex flex-col gap-1">
          <label htmlFor="duracaoHoras" className="text-sm font-medium">
            Duração (horas)
          </label>
          <select
            id="duracaoHoras"
            value={duracao}
            onChange={(e) => setDuracao(Number(e.target.value))}
            className="rounded-md border border-border px-3 py-2"
          >
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>
        </div>
      )}

      {horaInicio !== null && possuiAddonPodcast && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={podcastIncluido}
            onChange={(e) => setPodcastIncluido(e.target.checked)}
          />
          Incluir equipamento de podcast (+R$ {precoAddon.toFixed(2)}/h)
        </label>
      )}

      {valorEstimado !== null && (
        <p className="text-sm">
          Valor estimado:{" "}
          <span className="font-semibold text-primary">R$ {valorEstimado.toFixed(2)}</span>{" "}
          {descontoAplicavel > 0 && (
            <span className="text-foreground-muted line-through">
              R$ {((precoHora + (podcastIncluido ? (precoAddonPodcastHora ?? 0) : 0)) * duracao).toFixed(2)}
            </span>
          )}
          <br />
          <span className="text-foreground-muted">(pagamento presencial na recepção)</span>
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="spaceId" value={spaceId} />
        <input type="hidden" name="data" value={data} />
        <input type="hidden" name="horaInicio" value={horaInicio ?? ""} />
        <input type="hidden" name="duracaoHoras" value={duracao} />
        <input type="hidden" name="podcastIncluido" value={podcastIncluido ? "on" : ""} />

        {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
        {state?.success && (
          <p className="text-sm text-green-700">
            Reserva criada! Veja em &quot;Minhas reservas&quot;.
          </p>
        )}

        <Button type="submit" disabled={horaInicio === null || pending}>
          {pending ? "Reservando..." : "Reservar"}
        </Button>
      </form>
    </div>
  );
}
