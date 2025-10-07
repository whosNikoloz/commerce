import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const response = await apiFetch<{ success: boolean; message: string }>(
      `${backendUrl}/BOGPayment/${orderId}/cancel`,
      {
        method: "POST",
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("BOG Payment cancellation error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
