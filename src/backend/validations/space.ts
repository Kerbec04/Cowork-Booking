import { z } from "zod";

export const spaceSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  tipo: z.enum([
    "SALA_REUNIAO",
    "SALA_PODCAST",
    "SALA_ATENDIMENTO",
    "ESTACAO_INDIVIDUAL",
  ]),
  capacidade: z.coerce.number().int().min(1).max(200),
  precoHora: z.coerce.number().positive().max(10000), // preço cheio, antes do desconto
  descontoPrimeiraReserva: z.coerce.number().int().min(0).max(100).default(0),
  descricao: z.string().trim().max(2000).optional().or(z.literal("")),
  fotos: z.array(z.url()).default([]),
  ativo: z.coerce.boolean().default(true),
  regrasUso: z.string().trim().max(2000).optional().or(z.literal("")),
  possuiAddonPodcast: z.coerce.boolean().default(false),
  precoAddonPodcastHora: z.coerce.number().positive().max(10000).optional(),
});

export type SpaceInput = z.infer<typeof spaceSchema>;
