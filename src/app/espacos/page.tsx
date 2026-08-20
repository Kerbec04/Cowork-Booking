import { requireUserPage } from "@/backend/auth/guards";
import { listActiveSpaces } from "@/backend/services/spaces";
import { SpaceCard } from "@/components/SpaceCard";

export default async function EspacosPage() {
  await requireUserPage();
  const espacos = await listActiveSpaces();

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <h1 className="mb-6 text-2xl font-bold text-primary">Espaços disponíveis</h1>

      {espacos.length === 0 ? (
        <p className="text-foreground-muted">Nenhum espaço cadastrado ainda.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {espacos.map((espaco) => (
            <SpaceCard key={espaco.id} space={espaco} />
          ))}
        </div>
      )}
    </main>
  );
}
