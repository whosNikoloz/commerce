import { NextRequest, NextResponse } from "next/server";
import { apiFetch } from "@/app/api/client/fetcher";

export async function GET(request: NextRequest, { params }: { params: { paymentId: string } }) {
  try {
    const { paymentId } = params;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const response = await apiFetch(`${backendUrl}/TBCPayment/${paymentId}`, {
      method: "GET",
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("TBC Payment status error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
