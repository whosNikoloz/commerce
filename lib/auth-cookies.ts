import { cookies } from "next/headers";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax" as const,
};

export async function setAuthCookies(
  accessToken: string,
  refreshToken?: string
) {
  const jar = await cookies();

  jar.set("accessToken", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 2, // 2 hours
  });

  if (refreshToken) {
    jar.set("refreshToken", refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }
}

export async function clearAuthCookies() {
  const jar = await cookies();

  jar.delete("accessToken");
  jar.delete("refreshToken");
}

export async function getAccessTokenFromCookie(): Promise<string | null> {
  const jar = await cookies();

  return jar.get("accessToken")?.value ?? null;
}

export async function getRefreshTokenFromCookie(): Promise<string | null> {
  const jar = await cookies();

  return jar.get("refreshToken")?.value ?? null;
}
