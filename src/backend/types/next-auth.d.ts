import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tipo: "CLIENTE" | "ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    tipo?: "CLIENTE" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    tipo?: "CLIENTE" | "ADMIN";
  }
}
