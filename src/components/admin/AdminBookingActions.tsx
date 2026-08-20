"use client";

import { useState, useTransition } from "react";

import { adminCancelBookingAction, confirmBookingAction } from "@/backend/actions/admin";
import type { BookingStatus } from "@/generated/prisma/client";

export function AdminBookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="flex gap-3">
        {status === "PENDENTE" && (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await confirmBookingAction(bookingId);
                setError(result?.error ?? null);
              })
            }
            className="text-sm text-green-700 hover:underline disabled:opacity-50"
          >
            Confirmar pagamento
          </button>
        )}
        {(status === "PENDENTE" || status === "CONFIRMADA") && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Cancelar esta reserva?")) {
                startTransition(async () => {
                  const result = await adminCancelBookingAction(bookingId);
                  setError(result?.error ?? null);
                });
              }
            }}
            className="text-sm text-red-700 hover:underline disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
      </div>
      {error && <p className="max-w-40 text-xs text-red-700">{error}</p>}
    </div>
  );
}
