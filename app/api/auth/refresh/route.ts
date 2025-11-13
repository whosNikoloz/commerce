import { NextRequest, NextResponse } from "next/server";

import { refreshTokens } from "@/app/api/services/authService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Call the backend to refresh the tokens
    const tokens = await refreshTokens(refreshToken);

    return NextResponse.json(tokens);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("Token refresh error:", error);

    return NextResponse.json(
      { error: error.message || "Failed to refresh token" },
      { status: 401 }
    );
  }
}
