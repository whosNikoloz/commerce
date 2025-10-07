import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, currency = "GEL", returnUrl, extraInfo, language = "KA" } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const paymentRequest = {
      userId,
      amount: {
        currency,
        total: amount,
      },
      currency,
      returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/payment/callback?provider=tbc`,
      extraInfo,
      language,
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
    console.error("TBC Payment creation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
