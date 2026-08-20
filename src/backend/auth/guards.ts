import "server-only";
import { redirect } from "next/navigation";

import { auth } from "@/backend/auth";
import { SafeActionError } from "@/backend/lib/errors";

// For use inside Server Actions — the action returns an error string instead of navigating.
export async function requireUser() {
  const session = await auth();
  if (!session?.user) throw new SafeActionError("Não autenticado.");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.tipo !== "ADMIN") throw new SafeActionError("Acesso restrito a administradores.");
  return user;
}

// For use inside protected Server Component pages — redirects instead of throwing.
export async function requireUserPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

export async function requireAdminPage() {
  const user = await requireUserPage();
  if (user.tipo !== "ADMIN") redirect("/");
  return user;
}
