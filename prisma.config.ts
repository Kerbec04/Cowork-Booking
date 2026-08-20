import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // CLI commands (migrate, studio, db push) connect directly, bypassing
    // Neon's pooler — pgbouncer's transaction mode doesn't support the
    // prepared statements/DDL that migrations need. The app itself connects
    // via the pooled DATABASE_URL, set separately in src/lib/prisma.ts.
    url: env("DIRECT_URL"),
  },
});
