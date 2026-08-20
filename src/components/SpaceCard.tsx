import Image from "next/image";
import Link from "next/link";

import { SPACE_TYPE_LABELS } from "@/backend/lib/constants";
import type { Space } from "@/generated/prisma/client";

export function SpaceCard({ space }: { space: Space }) {
  const foto = space.fotos[0];
  const precoHora = Number(space.precoHora);

  return (
    <Link
      href={`/espacos/${space.id}`}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative h-40 w-full bg-background-alt">
        {foto && <Image src={foto} alt={space.nome} fill className="object-cover" unoptimized />}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-medium text-secondary">{SPACE_TYPE_LABELS[space.tipo]}</span>
        <h2 className="font-heading text-lg font-semibold text-primary">{space.nome}</h2>
        <p className="line-clamp-2 text-sm text-foreground-muted">{space.descricao}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span>Capacidade: {space.capacidade}</span>
          <span className="font-semibold text-primary">R$ {precoHora.toFixed(2)}/h</span>
        </div>
        {space.descontoPrimeiraReserva > 0 && (
          <span className="text-xs text-secondary">
            {space.descontoPrimeiraReserva}% OFF na primeira reserva
          </span>
        )}
      </div>
    </Link>
  );
}
