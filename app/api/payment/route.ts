import { NextResponse } from "next/server";

import { CreateOrderPayload, PaymentProvider } from "@/lib/payment";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL!;

type ClientBody = CreateOrderPayload & { provider: PaymentProvider };

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as ClientBody;

    const res = await fetch(`${BACKEND}/api/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // includes provider now
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");

      return NextResponse.json({ error: text || "Create failed" }, { status: 500 });
    }

    const json = await res.json();

    return NextResponse.json(json);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unexpected error" }, { status: 500 });
  }
}
