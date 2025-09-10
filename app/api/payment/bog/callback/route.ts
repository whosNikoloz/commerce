import { NextRequest, NextResponse } from "next/server";

import { markOrderComplete, markOrderFailed } from "../../webapi";

export async function POST(req: NextRequest) {
  try {
    // BOG posts JSON like:
    // { status, order_id, payment_hash, status_description, shop_order_id, ipay_payment_id, ... }
    const body = await req.json().catch(() => ({}) as any);

    const shopOrderId: string | undefined = body?.shop_order_id; // your original orderId
    const orderId: string | undefined = body?.order_id; // BOG order id
    const rawStatus = String(body?.status ?? "").toUpperCase();

    if (!shopOrderId || !orderId) {
      return NextResponse.json({ error: "Missing shop_order_id or order_id" }, { status: 400 });
    }

    // OPTIONAL: verify authenticity by comparing payment_hash with what you stored on create
    // OPTIONAL: double-check via bogGetOrder(orderId) before marking final

    // Normalize and update
    if (rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "CAPTURED") {
      await markOrderComplete(shopOrderId, {
        provider: "bog",
        bankId: orderId,
        bankStatus: rawStatus,
        bankResponse: body,
      });
    } else if (
      rawStatus === "DECLINED" ||
      rawStatus === "CANCELLED" ||
      rawStatus === "CANCELED" ||
      rawStatus === "FAILED"
    ) {
      await markOrderFailed(shopOrderId, {
        provider: "bog",
        bankId: orderId,
        reason: rawStatus,
        bankResponse: body,
      });
    } // else: PENDING / CREATED etc. — acknowledge but don't change status

    // Always 200 so the bank doesn’t keep retrying
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "BOG callback handling error" },
      { status: 500 },
    );
  }
}
