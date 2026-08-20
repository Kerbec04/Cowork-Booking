"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { prisma } from "@/backend/db/prisma";
import { signIn, signOut } from "@/backend/auth";
import { loginSchema, signupSchema } from "@/backend/validations/auth";

export type AuthActionState = { error?: string } | undefined;

export async function signupAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    telefone: formData.get("telefone") || undefined,
    senha: formData.get("senha"),
    lgpdConsent: formData.get("lgpdConsent") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "Já existe uma conta com este e-mail." };

  const senhaHash = await bcrypt.hash(parsed.data.senha, 12);
  await prisma.user.create({
    data: {
      nome: parsed.data.nome,
      email: parsed.data.email,
      telefone: parsed.data.telefone,
      senhaHash,
      lgpdConsentAt: new Date(),
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      senha: parsed.data.senha,
      redirectTo: "/espacos",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "Conta criada, mas não foi possível entrar automaticamente. Tente fazer login." };
    throw error; // NEXT_REDIRECT — must propagate
  }
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });
  if (!parsed.success) return { error: "E-mail ou senha inválidos." };

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      senha: parsed.data.senha,
      redirectTo: "/espacos",
    });
  } catch (error) {
    if (error instanceof AuthError) return { error: "E-mail ou senha inválidos." };
    throw error; // NEXT_REDIRECT — must propagate
  }
}

export async function googleSignInAction() {
  await signIn("google", { redirectTo: "/espacos" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
