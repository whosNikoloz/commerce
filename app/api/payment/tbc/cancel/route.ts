import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, amount } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const cancelRequest = {
      amount,
    };

    const response = await apiFetch<{ success: boolean; message: string }>(
      `${backendUrl}/TBCPayment/${paymentId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify(cancelRequest),
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("TBC Payment cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
