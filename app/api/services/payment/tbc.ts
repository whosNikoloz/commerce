import type {
  TBCPaymentCreationResult,
  TBCPaymentDetails,
} from "@/types/payment";

import { apiFetch } from "../../client/fetcher";


export class TBCPaymentService {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl =
      baseUrl ||
      process.env.NEXT_PUBLIC_BACKEND_API_URL ||
      "https://localhost:7043";
  }

  async createPayment(
    amount: number,
    orderId: string,
    currency: string = "GEL",
    returnUrl?: string,
    extraInfo?: string,
    language: string = "KA"
  ): Promise<TBCPaymentCreationResult> {
    const body = {
      amount: {
        currency,
        total: amount,
      },
      currency,
      returnUrl:
        returnUrl || `${window.location.origin}/payment/callback?provider=tbc`,
      extraInfo,
      language,
      merchantPaymentId: orderId,
    };

    return apiFetch<TBCPaymentCreationResult>(
      `${this.baseUrl}/TBCPayment/create`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );
  }

  async getPaymentStatus(paymentId: string): Promise<TBCPaymentDetails> {
    return apiFetch<TBCPaymentDetails>(`${this.baseUrl}/TBCPayment/${paymentId}`, {
      method: "GET",
    });
  }

  async cancelPayment(paymentId: string, amount: number): Promise<boolean> {
    const result = await apiFetch<{ success: boolean }>(
      `${this.baseUrl}/TBCPayment/${paymentId}/cancel`,
      {
        method: "POST",
        body: JSON.stringify({ amount }),
      }
    );

    return result.success;
  }
}

export const tbcPaymentService = new TBCPaymentService();
