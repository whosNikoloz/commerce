import { NextRequest, NextResponse } from "next/server";

import { markOrderComplete, markOrderFailed } from "../../webapi";

import { tbcGetPayment } from "@/lib/payment/tbc";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // TBC can send either PaymentId or paymentId
    const payId: string | undefined = body?.PaymentId ?? body?.paymentId;

    if (!payId) {
      return NextResponse.json({ error: "Missing PaymentId" }, { status: 400 });
    }

    const details = await tbcGetPayment(payId);
    const rawStatus = String(details?.status ?? "").toUpperCase();

    const orderId: string | undefined = details?.merchantPaymentId ?? body?.merchantPaymentId;

    if (!orderId) {
      // If you also keep a mapping payId -> orderId in your Web API, you could call it here.
      // Otherwise we can’t safely update your DB without the orderId.
      return NextResponse.json(
        { error: "Missing merchantPaymentId (orderId) on TBC details" },
        { status: 400 },
      );
    }

    // 3) Normalize and update your DB via your Web API
    if (rawStatus === "SUCCEEDED") {
      await markOrderComplete(orderId, {
        provider: "tbc",
        bankId: payId,
        bankStatus: rawStatus,
        bankResponse: details, // optional: store trimmed JSON
      });
    } else if (rawStatus === "FAILED" || rawStatus === "CANCELED" || rawStatus === "CANCELLED") {
      await markOrderFailed(orderId, {
        provider: "tbc",
        bankId: payId,
        reason: rawStatus,
        bankResponse: details,
      });
    } else {
      // Pending / Created / etc. — do nothing (or you can 200 OK so TBC doesn't retry)
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "TBC callback handling error" },
      { status: 500 },
    );
  }
}
