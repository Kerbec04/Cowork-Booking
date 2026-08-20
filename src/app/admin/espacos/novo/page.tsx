import { requireAdminPage } from "@/backend/auth/guards";
import { createSpaceAction } from "@/backend/actions/admin";
import { SpaceForm } from "@/components/admin/SpaceForm";

export default async function NovoEspacoPage() {
  await requireAdminPage();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Novo espaço</h1>
      <SpaceForm action={createSpaceAction} submitLabel="Criar espaço" />
    </main>
  );
}
