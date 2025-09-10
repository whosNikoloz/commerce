const TBC_BASE = process.env.TBC_API_BASE ?? "https://api.tbcbank.ge";
const TBC_KEY = process.env.TBC_API_KEY!;

async function tbcToken(): Promise<string> {
  const res = await fetch(`${TBC_BASE}/v1/tpay/access-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      apikey: TBC_KEY,
    },
    body: new URLSearchParams({
      client_id: process.env.TBC_CLIENT_ID!,
      client_secret: process.env.TBC_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) throw new Error(`TBC token failed: ${res.status}`);
  const json = await res.json();

  return json.access_token as string;
}

export async function tbcCreatePayment(input: {
  payload: import("./types").CreateOrderPayload;
  methods?: string[]; // e.g. ["CARD","APPLEPAY"]
  language?: "EN" | "KA";
}) {
  const access = await tbcToken();

  const returnurl = `${process.env.APP_BASE_URL}/checkout/result?provider=tbc`;
  const callbackUrl = `${process.env.APP_BASE_URL}/api/payment/tbc/callback`;

  const body: any = {
    amount: { currency: "GEL", total: Number(input.payload.amount.toFixed(2)) },
    returnurl,
    merchantPaymentId: input.payload.orderId,
    description: `Order ${input.payload.orderId}`,
    language: input.language ?? "EN",
    callbackUrl,
  };

  if (input.methods?.length) body.methods = input.methods;

  const res = await fetch(`${TBC_BASE}/v1/tpay/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      apikey: TBC_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();

    throw new Error(`TBC payment failed: ${res.status} ${txt}`);
  }
  const json = await res.json();

  const approve = (json.links || []).find((l: any) => l.rel === "approval_url")?.uri;

  if (!approve) throw new Error("TBC approval_url missing");

  return { payId: json.payId as string, paymentUrl: approve as string, raw: json };
}

export async function tbcGetPayment(payId: string) {
  const access = await tbcToken();
  const res = await fetch(`${TBC_BASE}/v1/tpay/payments/${encodeURIComponent(payId)}`, {
    headers: { Authorization: `Bearer ${access}`, apikey: TBC_KEY },
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`TBC get payment failed: ${res.status}`);

  return res.json();
}
