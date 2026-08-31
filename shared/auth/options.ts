import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/shared/config/env";

type UrusAuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  firstName?: string | null;
  profilePic?: string | null;
};

type UrusAuthResponse = {
  access?: string;
  refresh?: string;
  user?: {
    id?: string | number;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_pic?: string | null;
  };
};

type BackendJwt = {
  accessToken?: string | null;
  refreshToken?: string | null;
  error?: "RefreshAccessTokenError";
};

function tokenExpiresSoon(accessToken?: string | null): boolean {
  if (!accessToken) return true;
  try {
    const payload = JSON.parse(
      Buffer.from(accessToken.split(".")[1], "base64url").toString("utf8"),
    ) as { exp?: number };
    return !payload.exp || payload.exp * 1000 <= Date.now() + 30_000;
  } catch {
    return true;
  }
}

async function refreshBackendToken(token: BackendJwt): Promise<BackendJwt> {
  if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" };
  try {
    const response = await fetch(`${env.apiBaseUrl}/webapp/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Refresh recusado pelo backend");
    const data = (await response.json()) as { access?: string; refresh?: string };
    if (!data.access) throw new Error("Resposta de refresh inválida");
    return {
      ...token,
      accessToken: data.access,
      refreshToken: data.refresh ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, accessToken: null, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
          ].join(" "),
        },
      },
    }),
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
          let detail = "Email ou senha invalidos.";
          try {
            const errorData = await response.json();
            if (typeof errorData?.detail === "string") {
              detail = errorData.detail;
            }
          } catch {
            detail = "Nao foi possivel fazer login.";
          }
          throw new Error(detail);
        }

        const data = await response.json();
        const user = data.user ?? data;

        return {
          id: String(user.id ?? user.email ?? credentials.email),
          name: user.name ?? user.user_name ?? user.email ?? credentials.email,
          email: user.email ?? credentials.email,
          accessToken: data.access ?? data.token ?? null,
          refreshToken: data.refresh ?? null,
          firstName: user.first_name ?? user.firstName ?? null,
          profilePic: user.profile_pic ?? user.profilePic ?? null,
        } as {
          id: string;
          name?: string;
          email?: string;
          accessToken?: string | null;
          refreshToken?: string | null;
          firstName?: string | null;
          profilePic?: string | null;
        };
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
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }
      if (!account.id_token) {
        return "/auth?error=GoogleSignin";
      }

      try {
        const response = await fetch(`${env.apiBaseUrl}/webapp/auth/google/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_token: account.id_token,
          }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => null) as {
            detail?: string;
          } | null;
          console.error(
            "[google-auth] Backend recusou o login:",
            response.status,
            errorData?.detail ?? "Resposta sem detalhes"
          );
          return "/auth?error=GoogleSignin";
        }

        const data = (await response.json()) as UrusAuthResponse;
        const backendUser = data.user;
        Object.assign(user as UrusAuthUser, {
          id: String(backendUser?.id ?? user.id),
          name:
            [backendUser?.first_name, backendUser?.last_name]
              .filter(Boolean)
              .join(" ") || user.name,
          email: backendUser?.email ?? user.email,
          accessToken: data.access ?? null,
          refreshToken: data.refresh ?? null,
          firstName: backendUser?.first_name ?? null,
          profilePic: backendUser?.profile_pic ?? user.image ?? null,
        });
        return true;
      } catch (error) {
        console.error("[google-auth] Falha ao chamar o backend:", error);
        return "/auth?error=GoogleSignin";
      }
    },
    async jwt({ token, user }) {
      if (user && "accessToken" in user) {
        token.accessToken = (user as { accessToken?: string | null }).accessToken ?? null;
        token.firstName = (user as { firstName?: string | null }).firstName ?? null;
        token.refreshToken = (user as { refreshToken?: string | null }).refreshToken ?? null;
        token.profilePic = (user as { profilePic?: string | null }).profilePic ?? null;
      }
      if (!tokenExpiresSoon(token.accessToken as string | null | undefined)) return token;
      return refreshBackendToken(token as BackendJwt);
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as {
          accessToken?: string | null;
          firstName?: string | null;
          profilePic?: string | null;
        })
          .accessToken = (token as { accessToken?: string | null }).accessToken ?? null;
        (session.user as {
          accessToken?: string | null;
          refreshToken?: string | null;
          firstName?: string | null;
          profilePic?: string | null;
        })
          .firstName = (token as { firstName?: string | null }).firstName ?? null;
        (session.user as {
          accessToken?: string | null;
          refreshToken?: string | null;
          firstName?: string | null;
          profilePic?: string | null;
        })
          .profilePic = (token as { profilePic?: string | null }).profilePic ?? null;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        return new URL(url).origin === baseUrl ? url : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
};
