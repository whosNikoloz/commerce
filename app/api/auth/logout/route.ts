import { NextResponse } from "next/server";

import { clearAuthCookies } from "@/lib/auth-cookies";

export async function GET() {
  try {
    await clearAuthCookies();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}
