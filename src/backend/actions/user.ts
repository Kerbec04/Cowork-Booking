"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/backend/auth/guards";
import { unstable_update } from "@/backend/auth";
import { prisma } from "@/backend/db/prisma";
import { SafeActionError, toActionErrorMessage } from "@/backend/lib/errors";
import { changePasswordSchema, updateProfileSchema } from "@/backend/validations/user";

export type ProfileActionState = { error?: string; success?: boolean } | undefined;

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = updateProfileSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const user = await requireUser();

    if (parsed.data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
      if (existing && existing.id !== user.id) {
        throw new SafeActionError("Já existe uma conta com este e-mail.");
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        nome: parsed.data.nome,
        email: parsed.data.email,
        telefone: parsed.data.telefone ?? null,
      },
    });

    await unstable_update({ user: { name: parsed.data.nome, email: parsed.data.email } });
    // Header (root layout) shows the session name — invalidate it too, not just /perfil.
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível atualizar o perfil.") };
  }
}

export async function changePasswordAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const parsed = changePasswordSchema.safeParse({
    senhaAtual: formData.get("senhaAtual"),
    novaSenha: formData.get("novaSenha"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const user = await requireUser();
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser?.senhaHash) {
      throw new SafeActionError("Esta conta usa login via Google e não tem senha para alterar.");
    }

    const senhaValida = await bcrypt.compare(parsed.data.senhaAtual, dbUser.senhaHash);
    if (!senhaValida) throw new SafeActionError("Senha atual incorreta.");

    const novaSenhaHash = await bcrypt.hash(parsed.data.novaSenha, 12);
    await prisma.user.update({ where: { id: user.id }, data: { senhaHash: novaSenhaHash } });

    return { success: true };
  } catch (error) {
    return { error: toActionErrorMessage(error, "Não foi possível alterar a senha.") };
  }
}
