import { NextRequest, NextResponse } from "next/server";

import { googleLogin, facebookLogin } from "@/app/api/services/authService";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, accessToken, idToken } = body;

    if (!provider || !accessToken) {
      return NextResponse.json(
        { error: "Missing provider or accessToken" },
        { status: 400 }
      );
    }

    let tokens;

    if (provider === "google") {
      if (!idToken) {
        return NextResponse.json(
          { error: "Missing idToken for Google login" },
          { status: 400 }
        );
      }

      tokens = await googleLogin({
        accessToken,
        idToken,
        role: 0, // Customer role
      });
    } else if (provider === "facebook") {
      tokens = await facebookLogin({
        accesToken: accessToken, // Note: typo in your API
        role: 0,
      });
    } else {
      return NextResponse.json(
        { error: "Invalid provider" },
        { status: 400 }
      );
    }

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("OAuth login error:", error);

    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
