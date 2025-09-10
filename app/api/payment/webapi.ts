import { apiFetch } from "../client/fetcher";

export type Provider = "bog" | "tbc";

export type OrderSessionItem = {
  productId: string;
  qty: number;
  unitPrice: number;
  name?: string;
};

export type CreateOrderSessionInput = {
  orderId: string;
  provider: Provider;
  amount: number;
  currency: "GEL";
  customer: { firstName: string; lastName: string; email: string; phone?: string };
  cart: OrderSessionItem[];
  bank?: { bogOrderId?: string; tbcPayId?: string };
};

export type CompleteOrderInput = {
  provider: Provider;
  bankId: string; // bog order_id or tbc payId
  bankStatus: string; // APPROVED|COMPLETED|SUCCEEDED
  bankResponse?: any; // (optional) raw details
};

export type FailOrderInput = {
  provider: Provider;
  bankId: string;
  reason: string; // DECLINED|FAILED|CANCELED...
  bankResponse?: any;
};

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Order";

// Adjust endpoints to your backend’s routes (I used a style like your Brand endpoints)
export async function createOrderSession(input: CreateOrderSessionInput): Promise<string> {
  return apiFetch<string>(`${API_BASE}/add-order-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function markOrderComplete(
  orderId: string,
  input: CompleteOrderInput,
): Promise<string> {
  return apiFetch<string>(`${API_BASE}/complete-order-by-${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function markOrderFailed(orderId: string, input: FailOrderInput): Promise<string> {
  return apiFetch<string>(`${API_BASE}/fail-order-by-${orderId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function getOrderStatus(orderId: string): Promise<{ status: string }> {
  return apiFetch<{ status: string }>(`${API_BASE}/get-order-status-by-${orderId}`);
}
