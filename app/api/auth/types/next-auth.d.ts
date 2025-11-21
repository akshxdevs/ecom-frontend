import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      role: string | null;
    } & DefaultSession["user"];
    jwt: string; 
  }

  interface User {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string | null;
    token: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    name: string;
    username: string;
    role: string | null;
    jwt: string; 
  }
}
