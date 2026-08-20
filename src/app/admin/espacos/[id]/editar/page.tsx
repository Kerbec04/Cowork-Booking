import { notFound } from "next/navigation";

import { requireAdminPage } from "@/backend/auth/guards";
import { updateSpaceAction } from "@/backend/actions/admin";
import { getSpace } from "@/backend/services/spaces";
import { SpaceForm } from "@/components/admin/SpaceForm";

export default async function EditarEspacoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const { id } = await params;
  const space = await getSpace(id);
  if (!space) notFound();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Editar espaço</h1>
      <SpaceForm
        action={updateSpaceAction.bind(null, id)}
        initialValues={{
          ...space,
          precoHora: Number(space.precoHora),
          precoAddonPodcastHora: space.precoAddonPodcastHora
            ? Number(space.precoAddonPodcastHora)
            : null,
        }}
        submitLabel="Salvar"
      />
    </main>
  );
}
