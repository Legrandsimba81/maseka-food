import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role?: string;
    avatarUrl?: string | null;
    image?: string | null;
    createdAt?: Date | string; // ajout
  }
  interface Session {
    user: {
      id: string;
      role?: string;
      avatarUrl?: string | null;
      createdAt?: Date | string; // ajout
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string;
    avatarUrl?: string | null;
    createdAt?: Date | string; // ajout
  }
}