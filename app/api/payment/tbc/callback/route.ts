import { NextRequest, NextResponse } from "next/server";

/**
 * TBC Payment Webhook Handler
 *
 * This endpoint receives webhook notifications from TBC bank.
 * The actual payment processing, database updates, and SignalR notifications
 * are handled by the backend C# API.
 *
 * This endpoint simply acknowledges receipt of the webhook.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const paymentId = body?.PaymentId ?? body?.paymentId;

    console.log("TBC webhook received:", {
      paymentId,
      status: body?.status,
    });

    // Just acknowledge receipt - backend handles the actual processing
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("TBC callback POST error:", err);
    return NextResponse.json(
      { error: err?.message ?? "TBC callback handling error" },
      { status: 500 },
    );
  }
}

/**
 * TBC Status Check Endpoint (for user redirects)
 *
 * When users are redirected back from TBC payment page,
 * this endpoint can be used to check status.
 * The frontend should use SignalR or polling to get real-time updates.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentId");

    console.log("TBC redirect received:", {
      paymentId,
    });

    // Just acknowledge - frontend will poll or use SignalR for status
    return NextResponse.json({
      ok: true,
      paymentId,
      message: "Use status endpoint or SignalR for payment status updates"
    });
  } catch (err: any) {
    console.error("TBC callback GET error:", err);
    return NextResponse.json(
      { error: err?.message ?? "TBC callback handling error" },
      { status: 500 },
    );
  }
}
