import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/backend/db/prisma";
import { diaSemanaOf, toZonedDateTime } from "@/backend/lib/date";
import { CANCELLATION_WINDOW_HOURS } from "@/backend/lib/constants";
import { precoComDesconto } from "@/backend/lib/pricing";
import { SafeActionError } from "@/backend/lib/errors";
import type { CreateBookingInput } from "@/backend/validations/booking";

type Availability = { diaSemana: number; horaAbertura: string; horaFechamento: string };

function parseHour(hhmm: string) {
  return Number(hhmm.split(":")[0]);
}

function hourIsOpen(availabilities: Availability[], diaSemana: number, hour: number) {
  return availabilities.some(
    (a) => a.diaSemana === diaSemana && hour >= parseHour(a.horaAbertura) && hour < parseHour(a.horaFechamento)
  );
}

export type DaySlot = { hour: number; inicio: Date; fim: Date; disponivel: boolean };

export async function getDayAvailability(spaceId: string, data: string): Promise<DaySlot[]> {
  const diaSemana = diaSemanaOf(data);

  const availabilities = await prisma.availability.findMany({
    where: { spaceId, diaSemana },
  });
  if (availabilities.length === 0) return [];

  const openHours = new Set<number>();
  for (const a of availabilities) {
    for (let h = parseHour(a.horaAbertura); h < parseHour(a.horaFechamento); h++) openHours.add(h);
  }

  const dayStart = toZonedDateTime(data, 0);
  const dayEnd = toZonedDateTime(data, 24);

  const [bookings, blocks] = await Promise.all([
    prisma.booking.findMany({
      where: {
        spaceId,
        status: { in: ["PENDENTE", "CONFIRMADA"] },
        inicio: { lt: dayEnd },
        fim: { gt: dayStart },
      },
      select: { inicio: true, fim: true },
    }),
    prisma.spaceBlock.findMany({
      where: { spaceId, inicio: { lt: dayEnd }, fim: { gt: dayStart } },
      select: { inicio: true, fim: true },
    }),
  ]);

  const now = new Date();

  return [...openHours]
    .sort((a, b) => a - b)
    .map((hour) => {
      const inicio = toZonedDateTime(data, hour);
      const fim = toZonedDateTime(data, hour + 1);
      const noPassado = inicio <= now;
      const ocupado = [...bookings, ...blocks].some((b) => b.inicio < fim && b.fim > inicio);
      return { hour, inicio, fim, disponivel: !noPassado && !ocupado };
    });
}

/** Elegível para o desconto de boas-vindas se nunca teve uma reserva não cancelada. */
export async function isElegivelParaDescontoPrimeiraReserva(userId: string) {
  const reservaAnterior = await prisma.booking.findFirst({
    where: { userId, status: { not: "CANCELADA" } },
    select: { id: true },
  });
  return reservaAnterior === null;
}

export async function createBooking(userId: string, input: CreateBookingInput) {
  const space = await prisma.space.findUnique({ where: { id: input.spaceId } });
  if (!space || !space.ativo) throw new SafeActionError("Espaço não encontrado ou indisponível.");

  const inicio = toZonedDateTime(input.data, input.horaInicio);
  const fim = toZonedDateTime(input.data, input.horaInicio + input.duracaoHoras);

  if (inicio <= new Date()) throw new SafeActionError("Não é possível reservar um horário no passado.");

  const diaSemana = diaSemanaOf(input.data);
  const availabilities = await prisma.availability.findMany({
    where: { spaceId: input.spaceId, diaSemana },
  });
  for (let h = input.horaInicio; h < input.horaInicio + input.duracaoHoras; h++) {
    if (!hourIsOpen(availabilities, diaSemana, h)) {
      throw new SafeActionError("Horário fora do funcionamento do espaço.");
    }
  }

  const incluirPodcast = input.podcastIncluido && space.possuiAddonPodcast;
  if (input.podcastIncluido && !space.possuiAddonPodcast) {
    throw new SafeActionError("Este espaço não tem addon de podcast.");
  }

  return prisma.$transaction(
    async (tx) => {
      const conflito = await tx.booking.findFirst({
        where: {
          spaceId: input.spaceId,
          status: { in: ["PENDENTE", "CONFIRMADA"] },
          inicio: { lt: fim },
          fim: { gt: inicio },
        },
      });
      if (conflito) throw new SafeActionError("Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.");

      const bloqueio = await tx.spaceBlock.findFirst({
        where: { spaceId: input.spaceId, inicio: { lt: fim }, fim: { gt: inicio } },
      });
      if (bloqueio) throw new SafeActionError("Esse horário está bloqueado para este espaço.");

      // Reavaliado dentro da transação (isolamento serializable) para não dar
      // o desconto duas vezes em reservas concorrentes do mesmo cliente novo.
      const reservaAnterior = await tx.booking.findFirst({
        where: { userId, status: { not: "CANCELADA" } },
        select: { id: true },
      });
      const desconto = reservaAnterior === null ? space.descontoPrimeiraReserva : 0;

      const precoBasePorHora = precoComDesconto(Number(space.precoHora), desconto);
      const precoAddonPorHora = incluirPodcast
        ? precoComDesconto(Number(space.precoAddonPodcastHora ?? 0), desconto)
        : 0;
      const valorTotal = (precoBasePorHora + precoAddonPorHora) * input.duracaoHoras;

      return tx.booking.create({
        data: {
          userId,
          spaceId: input.spaceId,
          inicio,
          fim,
          valorTotal,
          podcastIncluido: incluirPodcast,
          descontoAplicado: desconto,
          payment: {
            create: { gateway: "PRESENCIAL", status: "PENDENTE", valor: valorTotal },
          },
        },
        include: { space: true, payment: true },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
}

export function listUserBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { space: true, payment: true },
    orderBy: { inicio: "desc" },
  });
}

export function listAllBookings() {
  return prisma.booking.findMany({
    include: { space: true, payment: true, user: true },
    orderBy: { inicio: "desc" },
  });
}

async function cancel(bookingId: string, motivo: string | undefined, opts: { userId?: string; enforceWindow: boolean }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new SafeActionError("Reserva não encontrada.");
  if (opts.userId && booking.userId !== opts.userId) throw new SafeActionError("Esta reserva não pertence a este usuário.");
  if (booking.status !== "PENDENTE" && booking.status !== "CONFIRMADA") {
    throw new SafeActionError("Esta reserva não pode mais ser cancelada.");
  }

  if (opts.enforceWindow) {
    const limite = new Date(booking.inicio.getTime() - CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000);
    if (new Date() > limite) {
      throw new SafeActionError(
        `Cancelamento só é permitido até ${CANCELLATION_WINDOW_HOURS}h antes do início. Entre em contato com a recepção.`
      );
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELADA", canceladoEm: new Date(), motivoCancelamento: motivo },
  });
}

export function cancelBooking(userId: string, bookingId: string, motivo?: string) {
  return cancel(bookingId, motivo, { userId, enforceWindow: true });
}

export function adminCancelBooking(bookingId: string, motivo?: string) {
  return cancel(bookingId, motivo, { enforceWindow: false });
}

export async function confirmBooking(bookingId: string, metodo?: string) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId }, include: { payment: true } });
    if (!booking) throw new SafeActionError("Reserva não encontrada.");
    if (booking.status !== "PENDENTE") throw new SafeActionError("Apenas reservas pendentes podem ser confirmadas.");

    await tx.payment.update({
      where: { bookingId },
      data: { status: "APROVADO", metodo },
    });

    return tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMADA" },
      include: { space: true, user: true, payment: true },
    });
  });
}
