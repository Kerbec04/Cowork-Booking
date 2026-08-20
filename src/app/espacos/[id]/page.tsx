import Image from "next/image";
import { notFound } from "next/navigation";

import { requireUserPage } from "@/backend/auth/guards";
import { getSpace } from "@/backend/services/spaces";
import { isElegivelParaDescontoPrimeiraReserva } from "@/backend/services/bookings";
import { SPACE_TYPE_LABELS } from "@/backend/lib/constants";
import { precoComDesconto } from "@/backend/lib/pricing";
import { BookingWidget } from "@/components/BookingWidget";

export default async function EspacoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [space, user] = await Promise.all([getSpace(id), requireUserPage()]);

  if (!space || !space.ativo) notFound();

  const elegivelDesconto = await isElegivelParaDescontoPrimeiraReserva(user.id);
  const descontoAplicavel = elegivelDesconto ? space.descontoPrimeiraReserva : 0;

  const precoHora = Number(space.precoHora);
  const precoFinal = precoComDesconto(precoHora, descontoAplicavel);

  return (
    <main className="mx-auto grid w-full max-w-5xl flex-1 gap-8 px-6 py-10 md:grid-cols-2">
      <div className="flex flex-col gap-4">
        <div className="relative h-64 w-full overflow-hidden rounded-lg bg-background-alt">
          {space.fotos[0] && (
            <Image src={space.fotos[0]} alt={space.nome} fill className="object-cover" unoptimized />
          )}
        </div>
        <span className="text-sm font-medium text-secondary">{SPACE_TYPE_LABELS[space.tipo]}</span>
        <h1 className="font-heading text-2xl font-bold text-primary">{space.nome}</h1>
        <p className="text-foreground-muted">{space.descricao}</p>
        <p className="text-sm">Capacidade: {space.capacidade} pessoas</p>
        <p className="text-sm">
          <span className="font-semibold text-primary">R$ {precoFinal.toFixed(2)}/h</span>{" "}
          {descontoAplicavel > 0 && (
            <>
              <span className="text-foreground-muted line-through">R$ {precoHora.toFixed(2)}/h</span>{" "}
              <span className="text-secondary">({descontoAplicavel}% OFF na primeira reserva)</span>
            </>
          )}
        </p>
        {space.regrasUso && (
          <p className="text-sm text-foreground-muted">
            <strong>Regras de uso:</strong> {space.regrasUso}
          </p>
        )}
      </div>

      <BookingWidget
        spaceId={space.id}
        precoHora={precoHora}
        descontoAplicavel={descontoAplicavel}
        possuiAddonPodcast={space.possuiAddonPodcast}
        precoAddonPodcastHora={
          space.precoAddonPodcastHora ? Number(space.precoAddonPodcastHora) : null
        }
      />
    </main>
  );
}
