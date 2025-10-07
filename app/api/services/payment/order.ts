import { apiFetch } from "@/app/api/client/fetcher";
import type {
  CreateOrderSessionInput,
  CompleteOrderInput,
  FailOrderInput,
} from "@/types/payment";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "") + "Order";

export class OrderService {
  async createOrderSession(input: CreateOrderSessionInput): Promise<string> {
    return apiFetch<string>(`${API_BASE}/add-order-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  async markOrderComplete(orderId: string, input: CompleteOrderInput): Promise<string> {
    return apiFetch<string>(`${API_BASE}/complete-order-by-${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  async markOrderFailed(orderId: string, input: FailOrderInput): Promise<string> {
    return apiFetch<string>(`${API_BASE}/fail-order-by-${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  }

  async getOrderStatus(orderId: string): Promise<{ status: string }> {
    return apiFetch<{ status: string }>(`${API_BASE}/get-order-status-by-${orderId}`);
  }
}

export const orderService = new OrderService();
