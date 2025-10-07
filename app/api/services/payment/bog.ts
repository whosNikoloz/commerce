import type {
  BOGPaymentCreationResult,
  BOGPaymentDetails,
  BOGPaymentItem,
} from "@/types/payment";

export class BOGPaymentService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7043";
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
      redirect_url: returnUrl || `${window.location.origin}/payment/callback?provider=bog`,
      callback_url: `${window.location.origin}/api/payment/bog/callback`,
      locale,
      show_shop_order_id_on_extract: true,
    };

    const response = await fetch(`${this.baseUrl}/BOGPayment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create BOG payment");
    }

    return response.json();
  }

  async getPaymentStatus(orderId: string): Promise<BOGPaymentDetails> {
    const response = await fetch(`${this.baseUrl}/BOGPayment/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get BOG payment status");
    }

    return response.json();
  }

  async cancelPayment(orderId: string): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/BOGPayment/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel BOG payment");
    }

    const result = await response.json();
    return result.success;
  }
}

export const bogPaymentService = new BOGPaymentService();
