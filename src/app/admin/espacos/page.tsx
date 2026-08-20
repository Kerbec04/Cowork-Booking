import Link from "next/link";

import { requireAdminPage } from "@/backend/auth/guards";
import { deleteSpaceAction } from "@/backend/actions/admin";
import { listAllSpaces } from "@/backend/services/spaces";
import { SPACE_TYPE_LABELS } from "@/backend/lib/constants";
import { DeleteSpaceButton } from "@/components/admin/DeleteSpaceButton";

export default async function AdminEspacosPage() {
  await requireAdminPage();
  const espacos = await listAllSpaces();

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">Espaços</h1>
        <Link href="/admin/espacos/novo" className="rounded-md bg-primary px-4 py-2 text-white">
          Novo espaço
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-background-alt">
            <tr>
              <th className="px-4 py-2">Nome</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Preço/h</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {espacos.map((espaco) => (
              <tr key={espaco.id} className="border-t border-border">
                <td className="px-4 py-2">{espaco.nome}</td>
                <td className="px-4 py-2">{SPACE_TYPE_LABELS[espaco.tipo]}</td>
                <td className="px-4 py-2">R$ {Number(espaco.precoHora).toFixed(2)}</td>
                <td className="px-4 py-2">{espaco.ativo ? "Ativo" : "Inativo"}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/espacos/${espaco.id}/editar`}
                      className="text-primary hover:underline"
                    >
                      Editar
                    </Link>
                    <DeleteSpaceButton action={deleteSpaceAction.bind(null, espaco.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
