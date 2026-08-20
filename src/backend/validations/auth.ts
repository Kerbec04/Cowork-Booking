import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  senha: z.string().min(8),
});

export const signupSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.email(),
  telefone: z.string().trim().min(8).max(20).optional(),
  senha: z.string().min(8).max(72), // bcrypt truncates beyond 72 bytes
  lgpdConsent: z.literal(true, {
    error: "É necessário aceitar a Política de Privacidade para se cadastrar.",
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
