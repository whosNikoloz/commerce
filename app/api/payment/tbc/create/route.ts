import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, currency = "GEL", returnUrl, extraInfo, language = "KA", orderId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const paymentRequest = {
      userId,
      amount: amount,
      currency,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?provider=tbc`,
      extraInfo,
      language,
      //merchantPaymentId: orderId,
    };

    const response = await apiFetch<{ paymentId: string; redirectUrl: string }>(
      `${backendUrl}/TBCPayment/create`,
      {
        method: "POST",
        body: JSON.stringify(paymentRequest),
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("TBC Payment creation error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
