"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/app/context/cartContext";
import { useUser } from "@/app/context/userContext";
import { createOrderWithPayment } from "@/app/api/services/orderService";
import { PaymentType } from "@/types/payment";
import { getEnabledPaymentTypes } from "@/app/api/services/integrationService";
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

  const [paymentType, setPaymentType] = useState<PaymentType>(PaymentType.BOG);
  const [availablePaymentTypes, setAvailablePaymentTypes] = useState<PaymentType[] | null>(null);
  const [paymentTypesLoaded, setPaymentTypesLoaded] = useState(false);
  const [noPaymentMethods, setNoPaymentMethods] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load enabled payment integrations for the current tenant
  useEffect(() => {
    let cancelled = false;

    const loadPaymentTypes = async () => {
      try {
        const types = await getEnabledPaymentTypes();

        if (cancelled) return;

        if (types.length > 0) {
          setAvailablePaymentTypes(types);
          // Ensure current selection is valid
          if (!types.includes(paymentType)) {
            setPaymentType(types[0]);
          }
        } else {
          // No payment providers enabled for this tenant
          setAvailablePaymentTypes([]);
          setNoPaymentMethods(true);
        }
      } catch {
        if (cancelled) return;
        // On error, treat as no payment methods to avoid misleading options
        setAvailablePaymentTypes([]);
        setNoPaymentMethods(true);
      }

      if (!cancelled) {
        setPaymentTypesLoaded(true);
      }
    };

    loadPaymentTypes();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals
  //const shipping = subtotal > 50 ? 0 : 9.99;
  const shipping = 0;
  const tax = 0; // Tax disabled - handled by payment gateway
  const total = useMemo(
    () => Number((subtotal + shipping + tax).toFixed(2)),
    [subtotal, shipping, tax],
  );

  // Redirect to cart if empty
  useEffect(() => {
    if (mounted && cartLen === 0) {
      router.push("/cart");
    }
  }, [cartLen, router, mounted]);

  // Redirect to cart with login prompt if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.push("/cart?login=required");
    }
  }, [user, router, mounted]);

  // Track begin checkout event
  useEffect(() => {
    if (cart && cart.length > 0) {
      trackCheckoutBegin(cart);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.length]);

  // Loading skeleton
  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                  <div className="space-y-3">
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
                  <div className="space-y-2">
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
      setError(dictionary.checkout?.errors?.userNotLoggedIn || "Please log in to continue");

      return;
    }

    if (noPaymentMethods) {
      setError(
        dictionary.checkout?.noPaymentMethodsEnabled
        || "No payment methods are currently available. Please contact the store or try again later.",
      );

      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Format order items with variant field
      const orderItems = cart.map((item) => {
        const itemWithFacets = item as typeof item & { selectedFacets?: Record<string, string> };
        let variant: string | undefined;

        if (itemWithFacets.selectedFacets && Object.keys(itemWithFacets.selectedFacets).length > 0) {
          variant = Object.entries(itemWithFacets.selectedFacets)
            .map(([k, v]) => `${k}: ${v}`)
            .join(", ");
        }

        return {
          productId: item.id,
          quantity: item.quantity,
          variant,
        };
      });

      // Build return URL with status parameters
      const paymentReturnUrl = `${window.location.origin}/payment/callback`;

      // Create order with payment
      const orderResponse = await createOrderWithPayment({
        orderItems,
        shippingAddress: "Default Address", // TODO: Get from form
        shippingCity: "Tbilisi",
        shippingCountry: "Georgia",
        currency: "GEL",
        paymentType,
        paymentReturnUrl,
        // Buyer info from user context
        buyerFullName: user.userName || undefined,
        buyerEmail: user.email || undefined,
        //buyerPhone: user.phone || undefined,
        buyerPhone: "+995555555555",
        // Delivery amount
        deliveryAmount: shipping > 0 ? shipping : undefined,
        // Payment options
        applicationTypes: "web",
        paymentMethods: ["card"],
      });

      // Track payment info
      const paymentMethodName = paymentType === PaymentType.BOG || paymentType === PaymentType.BOGInstallment
        ? 'BOG'
        : 'FLITT';

      trackPaymentInfo(cart, paymentMethodName);

      // Store order and payment IDs for callback page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("lastOrderId", orderResponse.id);
        sessionStorage.setItem("lastOrderNumber", orderResponse.orderNumber);
        if (orderResponse.paymentId) {
          sessionStorage.setItem("currentPaymentId", orderResponse.paymentId);
        }
      }

      // Redirect to payment gateway
      if (orderResponse.paymentRedirectUrl) {
        window.location.href = orderResponse.paymentRedirectUrl;
      } else {
        throw new Error("No payment redirect URL received");
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error('Checkout error:', e);

      // Handle specific error types
      let errorMessage = dictionary.checkout?.errors?.paymentFailed || "Payment failed. Please try again.";

      if (e?.response?.status === 400) {
        errorMessage = e?.response?.data?.message || e?.message || 'Invalid order data. Please check your information.';
      } else if (e?.response?.status === 401) {
        errorMessage = 'Please log in to complete your purchase.';
        router.push('/cart?login=required');
      } else if (e?.response?.status === 403) {
        errorMessage = 'You do not have permission to complete this action.';
      } else if (e?.response?.status === 404) {
        errorMessage = 'Product not available. Please refresh and try again.';
      } else if (e?.response?.status >= 500) {
        errorMessage = 'Server error. Please try again in a moment.';
      } else if (e?.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
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
              {dictionary.checkout?.title || 'Checkout'}
            </h1>
            <p className="font-primary text-text-subtle dark:text-text-subtledark">
              {dictionary.checkout?.completePurchase || 'Complete your purchase'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 border border-red-500/30 rounded p-3 bg-red-500/5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckoutForm
            availableTypes={paymentTypesLoaded ? (availablePaymentTypes ?? []) : []}
            loading={!paymentTypesLoaded}
            value={paymentType}
            onChange={setPaymentType}
          />
          <OrderSummary
            isProcessing={isProcessing || noPaymentMethods}
            submitButtonLabel={
              isProcessing
                ? (dictionary.checkout?.redirecting || 'Redirecting...')
                : `${dictionary.checkout?.paySecurely || 'Pay Securely'} • ₾${total.toFixed(2)}`
            }
            totalOverride={total}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
