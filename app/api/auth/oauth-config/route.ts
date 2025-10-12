import { NextResponse } from "next/server";

import { getOAuthCredentials } from "@/app/api/services/authService";

export async function GET() {
  try {
    const credentials = await getOAuthCredentials();

    return NextResponse.json({
      googleClientId: credentials.googleClientId,
      facebookClientId: credentials.facebookClientId,
    });
  } catch (error: any) {
    console.error("Failed to fetch OAuth credentials:", error);

    return NextResponse.json({
      googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      facebookClientId: process.env.NEXT_PUBLIC_FACEBOOK_CLIENT_ID || "",
    });
  }
}
