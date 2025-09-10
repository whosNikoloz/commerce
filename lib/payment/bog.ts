const BOG_BASE = process.env.BOG_API_BASE ?? "https://ipay.ge";

async function bogToken(): Promise<string> {
  const id = process.env.BOG_CLIENT_ID!;
  const secret = process.env.BOG_CLIENT_SECRET!;
  const basic = Buffer.from(`${id}:${secret}`).toString("base64");

  const res = await fetch(`${BOG_BASE}/opay/api/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    // you may add cache headers here if you want to memoize the token
  });

  if (!res.ok) throw new Error(`BOG token failed: ${res.status}`);
  const json = await res.json();

  return json.access_token as string;
}

export async function bogCreateOrder(input: {
  payload: import("./types").CreateOrderPayload;
  locale?: "ka" | "en-US";
}) {
  const access = await bogToken();

  const redirectUrl = `${process.env.APP_BASE_URL}/checkout/result?provider=bog`;
  const callbackUrl = `${process.env.APP_BASE_URL}/api/payment/bog/callback`;

  // Map items for BOG (iPay expects amount per item + qty + description)
  const items = input.payload.items.map((i) => ({
    product_id: i.productId,
    quantity: i.qty,
    amount: Number(i.unitPrice).toFixed(2),
    description: i.name ?? "Item",
  }));

  const body = {
    intent: "CAPTURE", // card or BOG internet banking allowed
    items,
    purchase_units: [{ amount: { currency_code: "GEL", value: input.payload.amount.toFixed(2) } }],
    shop_order_id: input.payload.orderId,
    redirect_url: redirectUrl,
    callback_url: callbackUrl, // supported by SDK & common guides
    locale: input.locale ?? "en-US",
    show_shop_order_id_on_extract: true,
  };

  const res = await fetch(`${BOG_BASE}/opay/api/v1/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();

    throw new Error(`BOG order failed: ${res.status} ${txt}`);
  }
  const json = await res.json();

  // Find approval link
  const approve = (json.links || json._links || []).find(
    (l: any) => l.rel?.toLowerCase() === "approve",
  )?.href;

  if (!approve) throw new Error("BOG approval link missing");

  return { orderId: json.order_id as string, paymentUrl: approve as string, raw: json };
}

export async function bogGetOrder(orderId: string) {
  const access = await bogToken();
  const res = await fetch(`${BOG_BASE}/opay/api/v1/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`BOG get order failed: ${res.status}`);

  return res.json();
}
