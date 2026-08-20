import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const HORARIO_PADRAO = [
  { diaSemana: 1, horaAbertura: "08:00", horaFechamento: "20:00" }, // seg
  { diaSemana: 2, horaAbertura: "08:00", horaFechamento: "20:00" }, // ter
  { diaSemana: 3, horaAbertura: "08:00", horaFechamento: "20:00" }, // qua
  { diaSemana: 4, horaAbertura: "08:00", horaFechamento: "20:00" }, // qui
  { diaSemana: 5, horaAbertura: "08:00", horaFechamento: "20:00" }, // sex
  { diaSemana: 6, horaAbertura: "08:00", horaFechamento: "14:00" }, // sáb
];

// Dados de exemplo — 30% OFF é um desconto de boas-vindas na primeira reserva
// não cancelada de cada cliente, não uma promoção corrente (ver
// backend/services/bookings.ts::isElegivelParaDescontoPrimeiraReserva).
const ESPACOS = [
  {
    nome: "Sala Individual",
    tipo: "SALA_ATENDIMENTO" as const,
    capacidade: 1,
    precoHora: 50,
    descontoPrimeiraReserva: 30,
    descricao: "Sala individual, ideal para atendimentos e ligações privadas.",
    fotos: ["https://picsum.photos/seed/coworking-individual/800/600"],
  },
  {
    nome: "Sala de Reunião Pequena (até 3 pessoas)",
    tipo: "SALA_REUNIAO" as const,
    capacidade: 3,
    precoHora: 60,
    descontoPrimeiraReserva: 30,
    descricao: "Sala de reunião compacta, para times pequenos.",
    fotos: ["https://picsum.photos/seed/coworking-reuniao-p/800/600"],
  },
  {
    nome: "Sala de Reunião Média (até 6 pessoas)",
    tipo: "SALA_REUNIAO" as const,
    capacidade: 6,
    precoHora: 90,
    descontoPrimeiraReserva: 30,
    descricao: "Sala de reunião para times médios.",
    fotos: ["https://picsum.photos/seed/coworking-reuniao-m/800/600"],
  },
  {
    nome: "Espaço Compartilhado",
    tipo: "ESTACAO_INDIVIDUAL" as const,
    capacidade: 1,
    precoHora: 20,
    descontoPrimeiraReserva: 30,
    descricao: "Estação de trabalho no open space.",
    fotos: ["https://picsum.photos/seed/coworking-compartilhado/800/600"],
  },
  {
    nome: "Sala de Reunião Grande (até 8 pessoas)",
    tipo: "SALA_REUNIAO" as const,
    capacidade: 8,
    precoHora: 150, // preço sem o addon de podcast
    descontoPrimeiraReserva: 30,
    possuiAddonPodcast: true,
    precoAddonPodcastHora: 100,
    descricao: "Sala de reunião para até 8 pessoas, com opção de equipamento de podcast.",
    fotos: ["https://picsum.photos/seed/coworking-reuniao-g/800/600"],
  },
];

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@example.com";
  const adminSenha = process.env.SEED_ADMIN_SENHA ?? "admin123";

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      nome: "Administrador",
      email: adminEmail,
      senhaHash: await bcrypt.hash(adminSenha, 12),
      tipo: "ADMIN",
      lgpdConsentAt: new Date(),
    },
  });
  console.log(`Admin: ${admin.email} (senha: ${adminSenha} — troque após o primeiro login)`);

  for (const espaco of ESPACOS) {
    const existente = await prisma.space.findFirst({ where: { nome: espaco.nome } });
    const space = existente
      ? await prisma.space.update({ where: { id: existente.id }, data: espaco })
      : await prisma.space.create({ data: espaco });

    await prisma.availability.deleteMany({ where: { spaceId: space.id } });
    await prisma.availability.createMany({
      data: HORARIO_PADRAO.map((h) => ({ ...h, spaceId: space.id })),
    });
    console.log(`Espaço: ${space.nome}`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
