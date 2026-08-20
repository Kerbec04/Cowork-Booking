"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/backend/auth/guards";
import * as spacesService from "@/backend/services/spaces";
import * as bookingsService from "@/backend/services/bookings";
import { sendBookingConfirmationEmail } from "@/backend/services/email";
import { toActionErrorMessage } from "@/backend/lib/errors";
import { spaceSchema } from "@/backend/validations/space";

export type AdminActionState = { error?: string; success?: boolean } | undefined;

function parseSpaceForm(formData: FormData) {
  return spaceSchema.safeParse({
    nome: formData.get("nome"),
    tipo: formData.get("tipo"),
    capacidade: formData.get("capacidade"),
    precoHora: formData.get("precoHora"),
    descontoPrimeiraReserva: formData.get("descontoPrimeiraReserva") || 0,
    descricao: formData.get("descricao") || undefined,
    fotos: (formData.get("fotos") as string | null)
      ?.split("\n")
      .map((url) => url.trim())
      .filter(Boolean) ?? [],
    ativo: formData.get("ativo") === "on",
    regrasUso: formData.get("regrasUso") || undefined,
    possuiAddonPodcast: formData.get("possuiAddonPodcast") === "on",
    precoAddonPodcastHora: formData.get("precoAddonPodcastHora") || undefined,
  });
}

export async function createSpaceAction(
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const parsed = parseSpaceForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await requireAdmin();
    await spacesService.createSpace(parsed.data);
    revalidatePath("/admin/espacos");
    revalidatePath("/espacos");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível criar o espaço.") };
  }
}

export async function updateSpaceAction(
  spaceId: string,
  _prevState: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const parsed = parseSpaceForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await requireAdmin();
    await spacesService.updateSpace(spaceId, parsed.data);
    revalidatePath("/admin/espacos");
    revalidatePath(`/espacos/${spaceId}`);
    revalidatePath("/espacos");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível salvar o espaço.") };
  }
}

export async function deleteSpaceAction(
  spaceId: string,
  _prevState: AdminActionState
): Promise<AdminActionState> {
  void _prevState; // required by useActionState's (state, formData) signature, unused here
  try {
    await requireAdmin();
    await spacesService.deleteSpace(spaceId);
    revalidatePath("/admin/espacos");
    revalidatePath("/espacos");
    return { success: true };
  } catch (error) {
    return {
      error: toActionErrorMessage(
        error,
        "Não foi possível excluir este espaço — ele já tem reservas. Desative-o em vez de excluir."
      ),
    };
  }
}

export async function confirmBookingAction(
  bookingId: string,
  metodo?: string
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    const booking = await bookingsService.confirmBooking(bookingId, metodo);
    await sendBookingConfirmationEmail(booking, booking.space, booking.user);
    revalidatePath("/admin/reservas");
    revalidatePath("/reservas");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível confirmar o pagamento.") };
  }
}

export async function adminCancelBookingAction(
  bookingId: string,
  motivo?: string
): Promise<AdminActionState> {
  try {
    await requireAdmin();
    await bookingsService.adminCancelBooking(bookingId, motivo);
    revalidatePath("/admin/reservas");
    revalidatePath("/reservas");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível cancelar a reserva.") };
  }
}
