"use client";

import { useActionState } from "react";

import { cancelBookingAction } from "@/backend/actions/bookings";
import { Button } from "@/components/Button";

export function CancelBookingForm({ bookingId }: { bookingId: string }) {
  const [state, formAction, pending] = useActionState(cancelBookingAction, undefined);

  if (state?.success) {
    return <p className="text-sm text-foreground-muted">Reserva cancelada.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="bookingId" value={bookingId} />
      <Button type="submit" variant="danger" disabled={pending}>
        {pending ? "Cancelando..." : "Cancelar"}
      </Button>
      {state?.error && <p className="max-w-48 text-right text-xs text-red-700">{state.error}</p>}
    </form>
  );
}
