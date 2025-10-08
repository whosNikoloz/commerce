import type {
  BOGPaymentCreationResult,
  BOGPaymentDetails,
  BOGPaymentItem,
} from "@/types/payment";

import { apiFetch } from "../../client/fetcher";


export class BOGPaymentService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "https://localhost:7043";
  }

  async createPayment(
    amount: number,
    items: Array<{ productId: string; qty: number; unitPrice: number; name: string }>,
    orderId: string,
    returnUrl?: string,
    locale: string = "en-US"
  ): Promise<BOGPaymentCreationResult> {
    const bogItems: BOGPaymentItem[] = items.map((item) => ({
      product_id: item.productId,
      quantity: item.qty,
      amount: Number(item.unitPrice).toFixed(2),
      description: item.name || "Item",
    }));

    const request = {
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
      redirect_url:
        returnUrl || `${window.location.origin}/payment/callback?provider=bog`,
      callback_url: `${window.location.origin}/api/payment/bog/callback`,
      locale,
      show_shop_order_id_on_extract: true,
    };

    return apiFetch<BOGPaymentCreationResult>(
      `${this.baseUrl}/BOGPayment/create`,
      {
        method: "POST",
        body: JSON.stringify(request),
      }
    );
  }

  async getPaymentStatus(orderId: string): Promise<BOGPaymentDetails> {
    return apiFetch<BOGPaymentDetails>(`${this.baseUrl}/BOGPayment/${orderId}`, {
      method: "GET",
    });
  }

  async cancelPayment(orderId: string): Promise<boolean> {
    const result = await apiFetch<{ success: boolean }>(
      `${this.baseUrl}/BOGPayment/${orderId}/cancel`,
      {
        method: "POST",
      }
    );

    return result.success;
  }
}

export const bogPaymentService = new BOGPaymentService();
