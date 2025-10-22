import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getTenantByHost } from "@/lib/getTenantByHost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const queryHost = url.searchParams.get("host");

  const h = await headers();
  const headerHost = h.get("x-forwarded-host") || h.get("host") || "";
  const host = (queryHost || headerHost || "").replace(/^https?:\/\//, "");

  if (!host) {
    return NextResponse.json({ error: "Host not provided" }, { status: 400 });
  }

  try {
    const config = await getTenantByHost(host);

    return NextResponse.json(config, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: "Failed to resolve tenant" }, { status: 500 });
  }
}
