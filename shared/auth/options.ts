import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/shared/config/env";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const response = await fetch(`${env.apiBaseUrl}/webapp/auth/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        const user = data.user ?? data;

        return {
          id: String(user.id ?? user.email ?? credentials.email),
          name: user.name ?? user.user_name ?? user.email ?? credentials.email,
          email: user.email ?? credentials.email,
          accessToken: data.access ?? data.token ?? null,
        } as { id: string; name?: string; email?: string; accessToken?: string | null };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && "accessToken" in user) {
        token.accessToken = (user as { accessToken?: string | null }).accessToken ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { accessToken?: string | null }).accessToken =
          (token as { accessToken?: string | null }).accessToken ?? null;
      }
      return session;
    },
  },
};
