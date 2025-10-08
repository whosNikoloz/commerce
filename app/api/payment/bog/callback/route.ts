import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const paymentId = body?.PaymentId ?? body?.paymentId;

    console.log("BOG webhook received:", {
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

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const paymentId = searchParams.get("paymentId");

    console.log("BOG redirect received:", {
      paymentId,
    });

    return NextResponse.json({
      ok: true,
      paymentId,
      message: "Use status endpoint or SignalR for payment status updates"
    });
  } catch (err: any) {
    console.error("BOG callback GET error:", err);

    return NextResponse.json(
      { error: err?.message ?? "TBC callback handling error" },
      { status: 500 },
    );
  }
}
