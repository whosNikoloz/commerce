import { NextRequest, NextResponse } from "next/server";

import { apiFetch } from "@/app/api/client/fetcher";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, amount, items, orderId, returnUrl, locale = "en-US" } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const backendUrl = process.env.BACKEND_API_URL || "https://localhost:7043";

    const bogItems = items.map((item: any) => ({
      product_id: item.productId,
      quantity: item.qty,
      amount: Number(item.unitPrice).toFixed(2),
      description: item.name || "Item",
    }));

    const origin = request.nextUrl.origin;

    const paymentRequest = {
      userId,
      intent: "CAPTURE",
      items: bogItems,
      purchase_units: [
        {
          amount: {
            currency_code: "GEL",
            value: Number(amount).toFixed(2),
          },
        },
      ],
      shop_order_id: orderId,
      redirect_url: returnUrl || `${origin}/payment/callback?provider=bog`,
      callback_url: `${origin}/api/payment/bog/callback`,
      locale,
      show_shop_order_id_on_extract: true,
    };

    const response = await apiFetch<{ orderId: string; redirectUrl: string }>(
      `${backendUrl}/BOGPayment/create`,
      {
        method: "POST",
        body: JSON.stringify(paymentRequest),
      }
    );

    return NextResponse.json(response);
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error("BOG Payment creation error:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
