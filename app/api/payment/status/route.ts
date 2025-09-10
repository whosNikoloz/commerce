import { NextRequest, NextResponse } from "next/server";

import { bogGetOrder } from "@/lib/payment/bog";
import { tbcGetPayment } from "@/lib/payment/tbc";

export async function GET(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider");
  const id = req.nextUrl.searchParams.get("id");

  if (!provider || !id) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  if (provider === "bog") {
    const d = await bogGetOrder(id);

    return NextResponse.json({ provider, status: d?.status, raw: d });
  }
  if (provider === "tbc") {
    const d = await tbcGetPayment(id);

    return NextResponse.json({ provider, status: d?.status, raw: d });
  }

  return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
}
