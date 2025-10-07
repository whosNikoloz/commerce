import { useState } from "react";
import type { BOGPaymentCreationResult, BOGPaymentDetails } from "@/types/payment";

export function useBOGPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (
    amount: number,
    items: Array<{ productId: string; qty: number; unitPrice: number; name: string }>,
    orderId: string,
    returnUrl?: string,
    locale: string = "en-US"
  ): Promise<BOGPaymentCreationResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/bog/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount,
          items,
          orderId,
          returnUrl,
          locale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create BOG payment");
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

  const getPaymentStatus = async (orderId: string): Promise<BOGPaymentDetails | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/payment/bog/status/${orderId}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get BOG payment status");
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

  const cancelPayment = async (orderId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payment/bog/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel BOG payment");
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
