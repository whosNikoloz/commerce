export type PaymentProvider = "bog" | "tbc";

export type CartItem = {
  id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  originalPrice?: number | null;
  variantKey?: string | null;
  selectedFacets?: Record<string, string>;
};

export type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
};

export type Address = {
  line1: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
};

export type CreateOrderPayload = {
  orderId: string; // you can use UUID from client or server
  currency: string; // e.g. "GEL"
  items: Array<{ productId: string; qty: number; unitPrice: number }>;
  amount: number; // total amount
  customer: Customer;
  shippingAddress: Address;
  billingAddress?: Address;
  metadata?: Record<string, string | number | boolean>;
};

export type CreateOrderResponse = {
  orderId: string;
  paymentUrl: string;
};

export async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");

    throw new Error(`POST ${url} failed: ${res.status} ${text}`);
  }

  return res.json();
}
