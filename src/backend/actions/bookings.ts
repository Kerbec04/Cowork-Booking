"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/backend/auth/guards";
import * as bookingsService from "@/backend/services/bookings";
import { toActionErrorMessage } from "@/backend/lib/errors";
import { cancelBookingSchema, createBookingSchema } from "@/backend/validations/booking";

export async function getAvailabilityAction(spaceId: string, data: string) {
  const slots = await bookingsService.getDayAvailability(spaceId, data);
  return slots.map((s) => ({ hour: s.hour, disponivel: s.disponivel }));
}

export type BookingActionState =
  | { error?: string; success?: boolean; bookingId?: string }
  | undefined;

export async function createBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const parsed = createBookingSchema.safeParse({
    spaceId: formData.get("spaceId"),
    data: formData.get("data"),
    horaInicio: formData.get("horaInicio"),
    duracaoHoras: formData.get("duracaoHoras"),
    podcastIncluido: formData.get("podcastIncluido") === "on",
  });
  if (!parsed.success) return { error: "Selecione um horário válido." };

  try {
    const user = await requireUser();
    const booking = await bookingsService.createBooking(user.id, parsed.data);
    revalidatePath(`/espacos/${parsed.data.spaceId}`);
    revalidatePath("/reservas");
    revalidatePath("/admin/reservas");
    return { success: true, bookingId: booking.id };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível criar a reserva.") };
  }
}

export async function cancelBookingAction(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const parsed = cancelBookingSchema.safeParse({
    bookingId: formData.get("bookingId"),
    motivo: formData.get("motivo") || undefined,
  });
  if (!parsed.success) return { error: "Reserva inválida." };

  try {
    const user = await requireUser();
    await bookingsService.cancelBooking(user.id, parsed.data.bookingId, parsed.data.motivo);
    revalidatePath("/reservas");
    revalidatePath("/admin/reservas");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível cancelar a reserva.") };
  }
}
