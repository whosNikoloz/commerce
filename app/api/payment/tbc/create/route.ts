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

    const origin = request.nextUrl.origin;
    const queryParams = new URLSearchParams({
      orderId,
      amount: amount.toString(),
      currency,
      returnUrl: returnUrl || `${origin}/payment/callback?provider=tbc`,
      extraInfo: extraInfo || "",
      lang: language,
    });

    const response = await apiFetch<{ paymentId: string; redirectUrl: string }>(
      `${backendUrl}/TBCPayment/create?${queryParams.toString()}`,
      {
        method: "POST",
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
