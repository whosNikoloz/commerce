import { NextResponse } from "next/server";

import { refreshTokens } from "@/app/api/services/authService";
import { getRefreshTokenFromCookie, setAuthCookies } from "@/lib/auth-cookies";

export async function POST() {
  try {
    const refreshToken = await getRefreshTokenFromCookie();

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 401 }
      );
    }

    const tokens = await refreshTokens(refreshToken);

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Token refresh error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to refresh token" },
      { status: 401 }
    );
  }
}
