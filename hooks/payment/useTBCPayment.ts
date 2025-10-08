import { useState } from "react";
import type { TBCPaymentCreationResult, TBCPaymentDetails } from "@/types/payment";

export function useTBCPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (
    amount: number,
    orderId: string,
    currency: string = "GEL",
    returnUrl?: string,
    extraInfo?: string,
    language: string = "KA"
  ): Promise<TBCPaymentCreationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/tbc/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          orderId,
          currency,
          returnUrl,
          extraInfo,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create payment");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: string): Promise<TBCPaymentDetails | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/tbc/status/${paymentId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get payment status");
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelPayment = async (paymentId: string, amount: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/tbc/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId,
          amount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel payment");
      }

      const result = await response.json();
      return result.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createPayment,
    getPaymentStatus,
    cancelPayment,
    loading,
    error,
  };
}
