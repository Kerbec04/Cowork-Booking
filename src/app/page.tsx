import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold text-primary">Coworking Booking</h1>
      <p className="max-w-md text-foreground-muted">
        Reserve salas de reunião, sala de podcast, salas de atendimento e estações de
        trabalho no coworking, com disponibilidade em tempo real.
      </p>
      <Link
        href="/espacos"
        className="rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-primary-dark"
      >
        Ver espaços disponíveis
      </Link>
    </main>
  );
}
