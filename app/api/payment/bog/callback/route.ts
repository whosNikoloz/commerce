import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const paymentId = searchParams.get("paymentId");
        const orderId = searchParams.get("order_id") || searchParams.get("orderId");

        // BOG might send paymentId or orderId in query params or body depending on config
        // Based on TBC pattern, we'll try to forward what we get.
        // However, the backend PaymentCallback method expects `paymentId` query param.

        // If BOG sends data in body, we might need to parse it. 
        // For now, mirroring TBC's likely callback structure or BOG's redirect-back structure.
        // If this is a server-to-server callback, it might differ.

        // The user's backend code snippet for TBC had `[HttpGet("callback")]`. 
        // We are implementing `app/api/payment/bog/callback` which implies BOG calls this.
        // If BOG calls this, we need to notify backend.

        const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

        // Construct backend callback URL
        // Attempting to hit a BOG-specific callback on backend if it exists, 
        // OR if BOG uses the TBC controller style (unlikely).
        // Assuming a standard BOG controller exists with `Callback`.

        // Since I don't have BOG controller code, I will optimize for safety:
        // 1. Log the hit.
        // 2. call backend BOG service callback.

        // NOTE: If BOG sends parameters in POST body (common for webhooks), we read them.
        let body = {};
        try {
            body = await request.json();
        } catch {
            // Body might be empty or form-data
        }

        const response = await apiFetch(
            `${backendUrl}/BOGPayment/callback?paymentId=${paymentId || orderId || ""}`,
            {
                method: "POST", // or GET depending on backend
                body: JSON.stringify(body),
            }
        );

        return NextResponse.json(response);
    } catch (error: any) {
        // eslint-disable-next-line no-console
        console.error("BOG Callback error:", error);

        return NextResponse.json(
            { error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
