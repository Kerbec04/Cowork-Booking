import { z } from "zod";

export const updateProfileSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.email(),
  telefone: z.string().trim().min(8).max(20).optional(),
});

export const changePasswordSchema = z.object({
  senhaAtual: z.string().min(1),
  novaSenha: z.string().min(8).max(72), // bcrypt truncates beyond 72 bytes
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
