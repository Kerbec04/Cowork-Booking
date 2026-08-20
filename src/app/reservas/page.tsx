import { requireUserPage } from "@/backend/auth/guards";
import { listUserBookings } from "@/backend/services/bookings";
import { formatDataHora } from "@/backend/lib/date";
import { CancelBookingForm } from "@/components/CancelBookingForm";
import { StatusBadge } from "@/components/StatusBadge";

export default async function ReservasPage() {
  const user = await requireUserPage();
  const reservas = await listUserBookings(user.id);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Minhas reservas</h1>

      {reservas.length === 0 ? (
        <p className="text-foreground-muted">Você ainda não tem reservas.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {reservas.map((reserva) => (
            <li
              key={reserva.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-white p-4"
            >
              <div>
                <p className="font-medium">{reserva.space.nome}</p>
                <p className="text-sm text-foreground-muted">
                  {formatDataHora(reserva.inicio)} — {formatDataHora(reserva.fim)}
                </p>
                <p className="text-sm text-foreground-muted">
                  R$ {Number(reserva.valorTotal).toFixed(2)} · pagamento presencial
                  {reserva.podcastIncluido && " · com podcast"}
                </p>
                <div className="mt-1">
                  <StatusBadge status={reserva.status} />
                </div>
              </div>

              {(reserva.status === "PENDENTE" || reserva.status === "CONFIRMADA") && (
                <CancelBookingForm bookingId={reserva.id} />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
