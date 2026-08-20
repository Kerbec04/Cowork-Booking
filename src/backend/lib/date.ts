// This example operates in a single timezone (São Paulo, fixed at UTC-3 —
// Brazil abolished DST in 2019), so we hardcode the offset instead of
// depending on the server process's local timezone (which on Vercel is UTC).
const SAO_PAULO_OFFSET = "-03:00";
export const TIMEZONE = "America/Sao_Paulo";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** Combines a "YYYY-MM-DD" date and an hour (0-23) into the corresponding UTC instant. */
export function toZonedDateTime(data: string, hour: number): Date {
  return new Date(`${data}T${pad2(hour)}:00:00${SAO_PAULO_OFFSET}`);
}

/** 0 = domingo .. 6 = sábado, computed from the date string alone (no timezone ambiguity). */
export function diaSemanaOf(data: string): number {
  const [year, month, day] = data.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function formatHora(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatData(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function formatDataHora(date: Date): string {
  return `${formatData(date)} ${formatHora(date)}`;
}

/** Today's date as "YYYY-MM-DD" in São Paulo time. */
export function todayInSaoPaulo(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}
