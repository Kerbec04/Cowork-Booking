import { BOOKING_STATUS_LABELS } from "@/backend/lib/constants";
import type { BookingStatus } from "@/generated/prisma/client";

const COLORS: Record<BookingStatus, string> = {
  PENDENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADA: "bg-green-100 text-green-800",
  CANCELADA: "bg-red-100 text-red-800",
  CONCLUIDA: "bg-gray-100 text-gray-700",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[status]}`}>
      {BOOKING_STATUS_LABELS[status]}
    </span>
  );
}
