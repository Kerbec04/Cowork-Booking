import Link from "next/link";

import { requireAdminPage } from "@/backend/auth/guards";
import { listAllBookings } from "@/backend/services/bookings";

export default async function AdminPage() {
  await requireAdminPage();

  const reservas = await listAllBookings();
  const pendentes = reservas.filter((r) => r.status === "PENDENTE").length;
  const confirmadas = reservas.filter((r) => r.status === "CONFIRMADA").length;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Painel administrativo</h1>

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatCard label="Pendentes" value={pendentes} />
        <StatCard label="Confirmadas" value={confirmadas} />
        <StatCard label="Total" value={reservas.length} />
      </div>

      <div className="flex gap-4">
        <Link href="/admin/espacos" className="rounded-md bg-primary px-4 py-2 text-white">
          Gerenciar espaços
        </Link>
        <Link
          href="/admin/reservas"
          className="rounded-md border border-primary px-4 py-2 text-primary"
        >
          Ver todas as reservas
        </Link>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="text-sm text-foreground-muted">{label}</p>
    </div>
  );
}
