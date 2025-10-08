import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    error?: string;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
