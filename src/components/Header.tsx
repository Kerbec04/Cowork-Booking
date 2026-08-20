import Link from "next/link";

import { auth } from "@/backend/auth";
import { UserMenu } from "@/components/UserMenu";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Coworking Booking
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/espacos" className="text-foreground hover:text-primary">
            Espaços
          </Link>

          {session?.user ? (
            <>
              {session.user.tipo === "ADMIN" && (
                <Link href="/admin" className="text-foreground hover:text-primary">
                  Admin
                </Link>
              )}
              <UserMenu name={session.user.name ?? session.user.email ?? "Minha conta"} />
            </>
          ) : (
            <>
              <Link href="/login" className="text-foreground hover:text-primary">
                Entrar
              </Link>
              <Link
                href="/cadastro"
                className="rounded-md bg-primary px-3 py-1.5 text-white hover:bg-primary-dark"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
