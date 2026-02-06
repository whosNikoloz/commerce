"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import CheckoutForm from "./CheckoutForm";
import OrderSummary from "./OrderSummary";
import { CheckoutStep } from "./CheckoutProgress";
import CheckoutAddressStep from "./CheckoutAddressStep";

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
  const params = useParams();
  const lang = params.lang as string;
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

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
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
  const shipping = 0;
  const tax = 0; // Tax disabled - handled by payment gateway
  const total = useMemo(
    () => Number((subtotal + shipping + tax).toFixed(2)),
    [subtotal, shipping, tax],
  );

  // Redirect to cart if empty
  useEffect(() => {
    if (mounted && cartLen === 0) {
      router.push(`/${lang}/cart`);
    }
  }, [cartLen, router, mounted, lang]);

  // Redirect to cart with login prompt if not logged in
  useEffect(() => {
    if (mounted && !user) {
      router.push(`/${lang}/cart?login=required`);
    }
  }, [user, router, mounted, lang]);

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

    if (!selectedAddress) {
      setError(dictionary.checkout?.addressStep?.selectAction || "Please select a shipping address");
      setCurrentStep("address");
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
        shippingAddress: selectedAddress ? `${selectedAddress.street}, ${selectedAddress.city}` : "Default Address",
        shippingCity: selectedAddress?.city || "Tbilisi",
        shippingCountry: selectedAddress?.country || "Georgia",
        currency: "GEL",
        paymentType,
        paymentReturnUrl,
        // Buyer info from user context
        buyerFullName: user.userName || `${selectedAddress?.firstName} ${selectedAddress?.lastName}`.trim() || undefined,
        buyerEmail: user.email || undefined,
        buyerPhone: selectedAddress?.phoneNumber || "+995555555555",
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
      console.error('Checkout error:', e);
      let errorMessage = dictionary.checkout?.errors?.paymentFailed || "Payment failed. Please try again.";
      if (e?.response?.status === 400) {
        errorMessage = e?.response?.data?.message || e?.message || (dictionary.checkout?.errors?.invalidData || 'Invalid order data. Please check your information.');
      } else if (e?.response?.status === 401) {
        errorMessage = dictionary.checkout?.errors?.userNotLoggedIn || 'Please log in to complete your purchase.';
        router.push(`/${lang}/cart?login=required`);
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
            className="text-text-light dark:text-text-lightdark hover:bg-brand-muted/40 dark:hover:bg-brand-muteddark/30"
            disabled={isProcessing}
            size="icon"
            variant="ghost"
            onClick={() => {
              if (currentStep === "payment") {
                setCurrentStep("address");
              } else {
                router.push(`/${lang}/cart`);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-light dark:text-text-lightdark">
              {dictionary.checkout?.title || 'Checkout'}
            </h1>
            <p className="font-primary text-text-subtle dark:text-text-subtledark">
              {currentStep === "address" ? (dictionary.checkout?.selectAddress || "Select your delivery location") : (dictionary.checkout?.choosePayment || "Choose how you want to pay")}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm text-red-600 border border-red-500/30 rounded p-3 bg-red-500/5">
            {error}
          </div>
        )}


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            {currentStep === "address" ? (
              user ? (
                <CheckoutAddressStep
                  userId={user.id}
                  selectedAddressId={selectedAddress?.id || null}
                  onSelect={setSelectedAddress}
                  onAddNew={() => router.push(`/${lang}/profile/addresses/new?redirect=checkout`)}
                />
              ) : null
            ) : (
              <CheckoutForm
                availableTypes={paymentTypesLoaded ? (availablePaymentTypes ?? []) : []}
                loading={!paymentTypesLoaded}
                value={paymentType}
                onChange={setPaymentType}
              />
            )}
          </div>

          <OrderSummary
            isProcessing={isProcessing || noPaymentMethods || (currentStep === "address" && !selectedAddress)}
            submitButtonLabel={
              isProcessing
                ? (dictionary.checkout?.redirecting || 'Redirecting...')
                : currentStep === "address"
                  ? (dictionary.checkout?.continueToPayment || "Continue to Payment")
                  : `${dictionary.checkout?.paySecurely || 'Pay Securely'} • ₾${total.toFixed(2)}`
            }
            totalOverride={total}
            onSubmit={() => {
              if (currentStep === "address") {
                if (!selectedAddress) {
                  toast.error(dictionary.checkout?.addressStep?.selectAction || "Please select a shipping address");
                  return;
                }
                setCurrentStep("payment");
              } else {
                handleSubmit();
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
