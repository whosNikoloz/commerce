import { NextResponse } from "next/server";

import { loginCustomer } from "@/app/api/services/authService";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const tokens = await loginCustomer(email, password);

    await setAuthCookies(tokens.accessToken, tokens.refreshToken);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 401 }
    );
  }
}
