import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "@/app/config/api";

type BackendAuthPayload = {
  token: string;
  role: string;
  id?: number | string;
  username?: string;
};

const handler = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  logger: {
    error(code, metadata) {
      console.error("[next-auth][error]", code, metadata);
    },
    warn(code) {
      console.warn("[next-auth][warn]", code);
    },
    debug(code, metadata) {
      console.log("[next-auth][debug]", code, metadata);
    }
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = credentials?.identifier?.trim();
        const password = credentials?.password;

        if (!identifier || !password) {
          return null;
        }

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username: identifier, password }),
        });

        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "Đăng nhập thất bại.");
        }

        const data = (await response.json()) as BackendAuthPayload;

        return {
          id: String(data.id ?? identifier),
          name: data.username ?? identifier,
          email: null,
          backendToken: data.token,
          role: data.role,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "credentials" && user) {
        const data = user as { backendToken?: string; role?: string };
        token.backendToken = data.backendToken;
        token.role = data.role;
        token.name = user.name ?? token.name;
        token.email = user.email ?? token.email;
        token.backendError = undefined;
      }

      if (account?.provider === "google" && profile) {
        try {
          const response = await fetch(`${API_URL}/api/auth/social-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "GOOGLE",
              providerId: profile.sub,
              email: profile.email,
              fullName: profile.name,
            }),
          });

          if (!response.ok) {
            console.warn("[nextauth] backend social-login failed", {
              status: response.status,
            });
            const message = await response.text();
            throw new Error(message || "Đăng nhập Google thất bại.");
          }

          const data = (await response.json()) as BackendAuthPayload;
          token.backendToken = data.token;
          token.role = data.role;
          token.name = profile.name;
          token.email = profile.email;
          token.backendError = undefined;
        } catch (error) {
          token.backendToken = undefined;
          token.role = undefined;
          token.backendError = error instanceof Error ? error.message : "Đăng nhập Google thất bại.";
        }
      }

      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        backendToken: token.backendToken,
        role: token.role,
        backendError: token.backendError,
      };
    },
  },
});

export { handler as GET, handler as POST };
