import { prisma } from "@/backend/db/prisma";
import type { SpaceInput } from "@/backend/validations/space";

export function listActiveSpaces() {
  return prisma.space.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
  });
}

export function listAllSpaces() {
  return prisma.space.findMany({ orderBy: { nome: "asc" } });
}

export function getSpace(id: string) {
  return prisma.space.findUnique({
    where: { id },
    include: { availabilities: true },
  });
}

export function createSpace(input: SpaceInput) {
  return prisma.space.create({
    data: {
      ...input,
      descricao: input.descricao || null,
      regrasUso: input.regrasUso || null,
    },
  });
}

export function updateSpace(id: string, input: SpaceInput) {
  return prisma.space.update({
    where: { id },
    data: {
      ...input,
      descricao: input.descricao || null,
      regrasUso: input.regrasUso || null,
    },
  });
}

export function deleteSpace(id: string) {
  return prisma.space.delete({ where: { id } });
}
