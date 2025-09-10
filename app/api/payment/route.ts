import type { PaymentProvider } from "@/lib/payment/types";

import { NextRequest, NextResponse } from "next/server";

import { createOrderSession } from "./webapi";

import { bogCreateOrder } from "@/lib/payment/bog";
import { tbcCreatePayment } from "@/lib/payment/tbc";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const provider: PaymentProvider = body.provider;

    // Basic validation
    if (!body?.orderId || !body?.amount || !Array.isArray(body?.items)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (provider === "bog") {
      const out = await bogCreateOrder({ payload: body, locale: "en-US" });

      await createOrderSession({
        orderId: body.orderId,
        provider: "bog",
        amount: body.amount,
        currency: body.currency,
        customer: body.customer,
        cart: body.items,
        bank: { bogOrderId: out.orderId },
      });

      return NextResponse.json({ orderId: body.orderId, paymentUrl: out.paymentUrl });
    }

    if (provider === "tbc") {
      const out = await tbcCreatePayment({ payload: body, methods: undefined, language: "EN" });

      await createOrderSession({
        orderId: body.orderId,
        provider: "tbc",
        amount: body.amount,
        currency: body.currency,
        customer: body.customer,
        cart: body.items,
        bank: { tbcPayId: out.payId },
      });

      return NextResponse.json({ orderId: body.orderId, paymentUrl: out.paymentUrl });
    }

    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Payment init failed" }, { status: 500 });
  }
}
