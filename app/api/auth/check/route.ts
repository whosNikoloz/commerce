import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";

import { getAccessTokenFromCookie } from "@/lib/auth-cookies";

interface DecodedToken {
  role?: string | string[];
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  roles?: string | string[];
}

export async function GET() {
  const token = await getAccessTokenFromCookie();

  if (!token) {
    return NextResponse.json({ authorized: false, role: null });
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    const roleValue =
      decoded.role ??
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      decoded.roles;

    const roles = Array.isArray(roleValue) ? roleValue : roleValue ? [roleValue] : [];
    const isAdmin = roles.some(
      (r) => typeof r === "string" && r.toLowerCase() === "admin"
    );

    return NextResponse.json({ authorized: isAdmin, role: isAdmin ? "admin" : "customer" });
  } catch {
    return NextResponse.json({ authorized: false, role: null });
  }
}
