import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/app/api/client/fetcher";
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

    // Always 200 so the bank doesn't keep retrying
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "BOG callback handling error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    // Fetch order details from backend to verify status
    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";
    const details = await apiFetch<any>(`${backendUrl}/BOGPayment/${orderId}`, { method: "GET" });
    const rawStatus = String(details?.status ?? "").toUpperCase();
    const shopOrderId: string | undefined = details?.shop_order_id;

    if (!shopOrderId) {
      return NextResponse.json(
        { error: "Missing shop_order_id on BOG details" },
        { status: 400 }
      );
    }

    // Update your DB via your Web API
    if (rawStatus === "APPROVED" || rawStatus === "COMPLETED" || rawStatus === "CAPTURED") {
      await markOrderComplete(shopOrderId, {
        provider: "bog",
        bankId: orderId,
        bankStatus: rawStatus,
        bankResponse: details,
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
        bankResponse: details,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "BOG callback handling error" },
      { status: 500 }
    );
  }
}
