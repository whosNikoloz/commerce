import { NextResponse } from "next/server";

import { loginAdmin } from "@/app/api/services/authService";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const token = await loginAdmin({ email, password });

    await setAuthCookies(token);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}
