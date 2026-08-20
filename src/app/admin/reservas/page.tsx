import { requireAdminPage } from "@/backend/auth/guards";
import { listAllBookings } from "@/backend/services/bookings";
import { formatDataHora } from "@/backend/lib/date";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminBookingActions } from "@/components/admin/AdminBookingActions";

export default async function AdminReservasPage() {
  await requireAdminPage();
  const reservas = await listAllBookings();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Todas as reservas</h1>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-background-alt">
            <tr>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Espaço</th>
              <th className="px-4 py-2">Início</th>
              <th className="px-4 py-2">Fim</th>
              <th className="px-4 py-2">Valor</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {reservas.map((reserva) => (
              <tr key={reserva.id} className="border-t border-border">
                <td className="px-4 py-2">
                  {reserva.user.nome}
                  <br />
                  <span className="text-xs text-foreground-muted">{reserva.user.email}</span>
                </td>
                <td className="px-4 py-2">
                  {reserva.space.nome}
                  {reserva.podcastIncluido && (
                    <span className="ml-1 text-xs text-secondary">(+podcast)</span>
                  )}
                </td>
                <td className="px-4 py-2">{formatDataHora(reserva.inicio)}</td>
                <td className="px-4 py-2">{formatDataHora(reserva.fim)}</td>
                <td className="px-4 py-2">R$ {Number(reserva.valorTotal).toFixed(2)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={reserva.status} />
                </td>
                <td className="px-4 py-2">
                  <AdminBookingActions bookingId={reserva.id} status={reserva.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
