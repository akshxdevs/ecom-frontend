import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { RUST_API } from "@/app/config";

const api = axios.create({
  baseURL: RUST_API,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/signin",
    signOut: "/signin",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        try {
          const { data } = await api.post("/signin", {
            email: credentials.email,
            password: credentials.password,
          });

          if (!data?.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.username,
            username: data.user.username,
            role: data.user.role,
            token: data.token,
          };
        } catch (err: any) {
          const message =
            err?.response?.data ?? "Unable to sign in with those credentials.";
          throw new Error(typeof message === "string" ? message : "Sign in failed.");
        }
      },
    }),
  ],

  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google") {
        user.role = (user as any)?.role ?? "Customer";
      }

      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id =
          (user as any).id ?? token.id ?? account?.providerAccountId ?? "";
        token.email = user.email ?? token.email;
        token.name = user.name ?? token.name;
        token.username =
          (user as any).username ??
          token.username ??
          user.name ??
          user.email?.split("@")[0];
        token.role = (user as any).role ?? token.role ?? null;
        token.jwt =
          (user as any).token ??
          token.jwt ??
          account?.id_token ??
          account?.access_token;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.email = (token.email as string) ?? session.user.email!;
        session.user.username =
          (token.username as string) ??
          session.user.username ??
          session.user.email?.split("@")[0] ??
          "";
        session.user.name =
          session.user.name ?? (token.name as string) ?? session.user.username;
        session.user.role = (token.role as string | null) ?? null;
      }

      (session as any).jwt = token.jwt;

      return session;
    },
  },
});

export { handler as GET, handler as POST };
