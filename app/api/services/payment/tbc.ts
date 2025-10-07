import type {
  TBCPaymentCreationResult,
  TBCPaymentDetails,
} from "@/types/payment";

export class TBCPaymentService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://localhost:7043";
  }

  async createPayment(
    amount: number,
    currency: string = "GEL",
    returnUrl?: string,
    extraInfo?: string,
    language: string = "KA"
  ): Promise<TBCPaymentCreationResult> {
    const response = await fetch(`${this.baseUrl}/TBCPayment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency,
          total: amount,
        },
        currency,
        returnUrl: returnUrl || `${window.location.origin}/payment/callback?provider=tbc`,
        extraInfo,
        language,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create TBC payment");
    }

    return response.json();
  }

  async getPaymentStatus(paymentId: string): Promise<TBCPaymentDetails> {
    const response = await fetch(`${this.baseUrl}/TBCPayment/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to get TBC payment status");
    }

    return response.json();
  }

  async cancelPayment(paymentId: string, amount: number): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/TBCPayment/${paymentId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to cancel TBC payment");
    }

    const result = await response.json();
    return result.success;
  }
}

export const tbcPaymentService = new TBCPaymentService();
