import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { loginAdmin } from "@/app/api/services/authService";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  try {
    const token = await loginAdmin({ email, password });

    (await cookies()).set("admin_token", token, {
      httpOnly: true,
      // Use secure cookies only in production to avoid issues on http://localhost
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 2,
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 401 });
  }
}
