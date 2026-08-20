import { Resend } from "resend";
import { formatDataHora } from "@/backend/lib/date";
import { SPACE_TYPE_LABELS } from "@/backend/lib/constants";
import type { Booking, Space, User } from "@/generated/prisma/client";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function sendBookingConfirmationEmail(
  booking: Booking,
  space: Space,
  user: User
) {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY não configurado — pulando envio de confirmação.");
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Coworking Booking <reservas@example.com>",
    to: user.email,
    subject: "Reserva confirmada — Coworking Booking",
    text: [
      `Olá, ${user.nome}!`,
      "",
      `Sua reserva foi confirmada:`,
      `Espaço: ${space.nome} (${SPACE_TYPE_LABELS[space.tipo]})`,
      `Início: ${formatDataHora(booking.inicio)}`,
      `Fim: ${formatDataHora(booking.fim)}`,
      `Valor: R$ ${Number(booking.valorTotal).toFixed(2)}`,
      "",
      "Até breve!",
    ].join("\n"),
  });
}
