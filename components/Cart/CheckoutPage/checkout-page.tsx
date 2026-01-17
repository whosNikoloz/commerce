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
import { useDictionary } from "@/app/context/dictionary-provider";

export default function CheckoutPage() {
  const dictionary = useDictionary();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());
  const { trackCheckoutBegin, trackPaymentInfo } = useGA4();

  const [provider, setProvider] = useState<PaymentProvider>("bog");
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48" />
              </div>
            </div>

            {/* Content Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Payment Form Skeleton */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              </div>

              {/* Order Summary Skeleton */}
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartLen === 0) return null;

  const handleSubmit = async () => {
    if (!user?.id) {
      setError(dictionary.checkout.errors.userNotLoggedIn);

      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Format order items with variant field (per guide)
      const orderItems = cart.map((i) => {
        // Format variant from selectedFacets if available
        // CartItem type doesn't include selectedFacets, but it may exist at runtime
        const itemWithFacets = i as typeof i & { selectedFacets?: Record<string, string> };
        let variant: string | undefined;
        if (itemWithFacets.selectedFacets && Object.keys(itemWithFacets.selectedFacets).length > 0) {
          variant = Object.entries(itemWithFacets.selectedFacets)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }

        return {
          productId: i.id,
          quantity: i.quantity,
          variant: variant || undefined,
        };
      });

      // Per guide: Create order with paymentReturnUrl
      // Backend should return paymentRedirectUrl and paymentId if payment is created automatically
      const paymentReturnUrl = `${window.location.origin}/payment/callback?provider=${provider}`;
      
      const orderResponse = await createOrder({
        orderItems,
        shippingAddress: "Default Address", // TODO: Get from form
        shippingCity: "Tbilisi", // TODO: Get from form
        shippingState: "Tbilisi", // TODO: Get from form
        shippingZipCode: "0108", // TODO: Get from form
        shippingCountry: "Georgia", // TODO: Get from form
        customerNotes: undefined, // TODO: Get from form if available
        currency: "GEL",
        paymentReturnUrl, // Per guide: URL where user returns after payment
      }, user.id);

      const orderId = orderResponse.id;

      // Track payment info being added
      trackPaymentInfo(cart, provider.toUpperCase());

      // Per guide: Backend MUST return paymentRedirectUrl and paymentId in order response
      // The backend creates the payment automatically when creating the order
      if (!orderResponse.paymentRedirectUrl || !orderResponse.paymentId) {
        throw new Error(
          orderResponse.paymentErrorMessage || 
          dictionary.checkout.errors.paymentFailed ||
          "Payment could not be created. Please try again."
        );
      }

      // Per guide: Store order and payment IDs for callback page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastOrderId", orderId);
        sessionStorage.setItem("currentPaymentId", orderResponse.paymentId);
      }

      // Per guide: Redirect to TBC payment page
      window.location.href = orderResponse.paymentRedirectUrl;
    } catch (e: any) {
      console.error('Checkout error:', e);
      
      // Handle specific error types
      let errorMessage = dictionary.checkout.errors.paymentFailed || 'Payment failed';
      
      if (e?.response?.status === 400) {
        // Bad request - likely validation error
        errorMessage = e?.response?.data?.detail || e?.message || 'Invalid order data. Please check your information.';
      } else if (e?.response?.status === 401) {
        // Unauthorized
        errorMessage = 'Please log in to complete your purchase.';
        router.push('/cart?login=required');
      } else if (e?.response?.status === 403) {
        // Forbidden
        errorMessage = 'You do not have permission to complete this action.';
      } else if (e?.response?.status === 404) {
        // Not found
        errorMessage = 'Product or service not found. Please refresh and try again.';
      } else if (e?.response?.status >= 500) {
        // Server error
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (e?.message) {
        // Use error message if available
        errorMessage = e.message;
      } else if (typeof e === 'string') {
        errorMessage = e;
      }
      
      setError(errorMessage);
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
            <h1 className="font-heading text-2xl font-bold text-text-light dark:text-text-lightdark">
              {dictionary.checkout.title}
            </h1>
            <p className="font-primary text-text-subtle dark:text-text-subtledark">{dictionary.checkout.completePurchase}</p>
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
              isProcessing ? dictionary.checkout.redirecting : `${dictionary.checkout.paySecurely} • ₾${total.toFixed(2)}`
            }
            totalOverride={total}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
