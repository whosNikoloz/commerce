import type { NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";

import { googleLogin, facebookLogin, refreshTokens } from "@/app/api/services/authService";

async function authenticateWithBackend(account: any, provider: "google" | "facebook") {
  if (provider === "google") {
    return googleLogin({
      accessToken: account.access_token,
      idToken: account.id_token,
      role: 0,
    });
  }

  return facebookLogin({
    accesToken: account.access_token,
    role: 0,
  });
}

async function refreshAccessToken(token: any) {
  try {
    const { accessToken, refreshToken } = await refreshTokens(token.refreshToken);

    return {
      ...token,
      accessToken,
      refreshToken,
      accessTokenExpires: Date.now() + 2 * 60 * 60 * 1000,
      error: undefined,
    };
  } catch (e) {
    console.error("Error refreshing access token:", e);

    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ account }: { account?: import("next-auth").Account | null }) {
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "credentials") {
        return true;
      }

      return true;
    },

    async jwt({
      token,
      user,
      account,
      profile,
    }: {
      token: any;
      user?: any;
      account?: import("next-auth").Account | null;
      profile?: import("next-auth").Profile | null;
    }) {
      if (account && (account.provider === "google" || account.provider === "facebook")) {
        try {
          const { accessToken, refreshToken } = await authenticateWithBackend(account, account.provider as any);

          return {
            ...token,
            accessToken,
            refreshToken,
            accessTokenExpires: Date.now() + 2 * 60 * 60 * 1000,
            provider: account.provider,
            user: {
              name: profile?.name,
              email: profile?.email,
              image: (profile as any)?.picture || (profile as any)?.image,
            },
          };
        } catch (e) {
          console.error("Backend OAuth authentication error:", e);

          return { ...token, error: "BackendAuthError" };
        }
      }

      if (account?.provider === "credentials" && user && (user as any).tokens) {
        const { accessToken, refreshToken } = (user as any).tokens;

        return {
          ...token,
          accessToken,
          refreshToken,
          accessTokenExpires: Date.now() + 2 * 60 * 60 * 1000,
          provider: "credentials",
          user: { email: (user as any).email },
        };
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      if (token.refreshToken) {
        return refreshAccessToken(token);
      }

      return token;
    },

    async session({ session, token }: { session: import("next-auth").Session; token: any }) {
      session.user = token.user ?? session.user;
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      session.provider = token.provider as string | undefined;
      session.error = token.error as string | undefined;

      return session;
    },
  },

  pages: {
    error: "/auth/error",
  },

  session: {
    strategy: "jwt" as const,
    maxAge: 2 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
