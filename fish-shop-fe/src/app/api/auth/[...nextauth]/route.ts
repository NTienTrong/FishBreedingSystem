import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { API_URL } from "@/app/config/api";

type BackendAuthPayload = {
  token: string;
  role: string;
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
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
