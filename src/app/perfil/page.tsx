import { requireUserPage } from "@/backend/auth/guards";
import { prisma } from "@/backend/db/prisma";
import { ChangePasswordForm } from "@/components/forms/ChangePasswordForm";
import { ProfileForm } from "@/components/forms/ProfileForm";

export default async function PerfilPage() {
  const sessionUser = await requireUserPage();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: sessionUser.id },
    select: { nome: true, email: true, telefone: true, senhaHash: true },
  });

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col gap-10 px-6 py-12">
      <div>
        <h1 className="mb-6 text-2xl font-bold text-primary">Meu perfil</h1>
        <ProfileForm
          initialValues={{ nome: user.nome, email: user.email, telefone: user.telefone ?? "" }}
        />
      </div>

      <div>
        <h2 className="mb-6 text-2xl font-bold text-primary">Senha</h2>
        {user.senhaHash ? (
          <ChangePasswordForm />
        ) : (
          <p className="text-sm text-foreground-muted">
            Sua conta usa login via Google — não há senha para alterar.
          </p>
        )}
      </div>
    </main>
  );
}
