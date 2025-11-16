"use client";

import type { PaymentProvider } from "@/types/payment";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/app/context/cartContext";
import { apiPost } from "@/app/api/payment/helpers";
import { useUser } from "@/app/context/userContext";
import { createOrder } from "@/app/api/services/orderService";
import { useGA4 } from "@/hooks/useGA4";

export default function CheckoutPage() {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const { trackCheckoutBegin, trackPaymentInfo } = useGA4();

  const [provider, setProvider] = useState<PaymentProvider>("bog");
  const router = useRouter();

  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08;
  const total = useMemo(
    () => Number((subtotal + shipping + tax).toFixed(2)),
    [subtotal, shipping, tax],
  );

  useEffect(() => {
    if (cartLen === 0) router.push("/cart");
  }, [cartLen, router]);

  // Redirect to cart with login prompt if not logged in
  useEffect(() => {
    if (!user) {
      router.push("/cart?login=required");
    }
  }, [user, router]);

  // Track begin checkout event
  useEffect(() => {
    if (cart && cart.length > 0) {
      trackCheckoutBegin(cart);
    }
  }, [cart.length, trackCheckoutBegin]);

  if (cartLen === 0) return null;

  const handleSubmit = async () => {
    if (!user?.id) {
      setError("User not logged in");

      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      const orderItems = cart.map((i) => ({
        productId: i.id,
        quantity: i.quantity,
      }));

      const orderResponse = await createOrder({
        orderItems,
        shippingAddress: "Default Address",
        shippingCity: "Tbilisi",
        shippingCountry: "Georgia",
        currency: "GEL",
      } , user.id);

      const orderId = orderResponse.id;

      // Track payment info being added
      trackPaymentInfo(cart, provider.toUpperCase());

      let data: { orderId?: string; paymentId?: string; redirectUrl: string };

      if (provider === "bog") {
        data = await apiPost<{ orderId: string; redirectUrl: string }>(
          "/api/payment/bog/create",
          {
            userId: user.id,
            amount: total,
            orderItems,
            orderId,
            returnUrl: `${window.location.origin}/payment/callback?provider=bog`,
            locale: "KA",
          }
        );
      } else if (provider === "tbc") {
        data = await apiPost<{ paymentId: string; redirectUrl: string }>(
          "/api/payment/tbc/create",
          {
            userId: user.id,
            amount: total,
            currency: "GEL",
            returnUrl: `${window.location.origin}/payment/callback?provider=tbc`,
            extraInfo: `Order ${orderId}`,
            language: "KA",
          }
        );
      } else {
        throw new Error("Invalid payment provider");
      }

      if (!data?.redirectUrl) throw new Error("redirectUrl missing");

      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastOrderId", orderId);
      }

      window.location.href = data.redirectUrl;
    } catch (e: any) {
      setError(e?.message ?? "Failed to start payment.");
      setIsProcessing(false);
    }
  };


  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Button
            asChild
            className="text-text-light dark:text-text-lightdark hover:bg-brand-muted/40 dark:hover:bg-brand-muteddark/30"
            disabled={isProcessing}
            size="icon"
            variant="ghost"
          >
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-text-light dark:text-text-lightdark">
              Checkout
            </h1>
            <p className="text-text-subtle dark:text-text-subtledark">Complete your purchase</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 border border-red-500/30 rounded p-3 bg-red-500/5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckoutForm value={provider} onChange={setProvider} />
          <OrderSummary
            isProcessing={isProcessing}
            submitButtonLabel={
              isProcessing ? "Redirecting..." : `Pay Securely • ₾${total.toFixed(2)}`
            }
            totalOverride={total}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
