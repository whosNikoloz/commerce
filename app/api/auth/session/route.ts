import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

import { getAccessTokenFromCookie } from "@/lib/auth-cookies";

interface DecodedToken {
  id: string;
  user_name: string;
  email: string;
  email_confirmed: string;
  role?: string | string[];
  exp?: number;
}

export async function GET() {
  const token = await getAccessTokenFromCookie();

  if (!token) {
    return NextResponse.json({ user: null, token: null });
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    const user = {
      id: decoded.id,
      userName: decoded.user_name,
      email: decoded.email,
      emailConfirmed: decoded.email_confirmed === "True",
      role: Array.isArray(decoded.role) ? decoded.role[0] : decoded.role ?? null,
    };

    return NextResponse.json({ user, token });
  } catch {
    return NextResponse.json({ user: null, token: null });
  }
}
