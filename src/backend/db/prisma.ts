import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Standard Postgres wire protocol — works against local Postgres and against
// Neon's pooled connection string alike. The Neon-specific HTTP/WebSocket
// adapter (@prisma/adapter-neon) is only needed for edge runtimes; this app
// runs as regular Node.js serverless functions on Vercel.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
