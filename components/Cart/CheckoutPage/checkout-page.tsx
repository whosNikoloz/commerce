"use client";

import type { CreateOrderPayload, PaymentProvider } from "@/lib/payment/types";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CheckoutForm, { CheckoutFormValues } from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/app/context/cartContext";
import { apiPost } from "@/app/api/payment";
import { useUser } from "@/app/context/userContext";

export default function CheckoutPage() {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

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

  if (cartLen === 0) return null;

  const handleSubmit = async (form: CheckoutFormValues) => {
    setError(null);
    setIsProcessing(true);
    try {
      const payload: CreateOrderPayload & { provider: PaymentProvider } = {
        orderId: crypto.randomUUID(),
        currency: "GEL",
        amount: total,
        items: cart.map((i) => ({
          productId: i.id,
          qty: i.quantity,
          unitPrice: Number(i.price),
          name: i.name,
        })),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone || "",
        },
        shippingAddress: {
          line1: form.address,
          city: form.city,
          state: form.state || "",
          zip: form.zip || "",
          country: "GE",
        },
        billingAddress: form.sameAsShipping
          ? undefined
          : {
              line1: form.billingAddress || "",
              city: form.billingCity || "",
              state: form.billingState || "",
              zip: form.billingZip || "",
              country: "GE",
            },
        metadata: { source: "nextjs-checkout", cartItems: cart.length },
        provider,
      };

      const data = await apiPost<{ orderId: string; paymentUrl: string }>("/api/payment", payload);

      if (!data?.paymentUrl) throw new Error("paymentUrl missing");

      if (typeof window !== "undefined") sessionStorage.setItem("lastOrderId", data.orderId);
      window.location.href = data.paymentUrl;
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
          <CheckoutForm value={provider} onChange={setProvider} onSubmit={handleSubmit} />
          <OrderSummary
            isProcessing={isProcessing}
            submitButtonLabel={
              isProcessing ? "Redirecting..." : `Pay Securely • ₾${total.toFixed(2)}`
            }
            totalOverride={total}
          />
        </div>
      </div>
    </div>
  );
}
