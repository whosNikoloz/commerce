"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, CreditCard, MapPin } from "lucide-react";
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="animate-pulse space-y-6 sm:space-y-8">
            {/* Header skeleton */}
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-muted dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-7 sm:h-8 bg-muted dark:bg-white/10 rounded-lg w-28 sm:w-36" />
                <div className="h-3.5 bg-muted dark:bg-white/5 rounded w-40 sm:w-48" />
              </div>
            </div>
            {/* Progress bar card skeleton */}
            <div className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-4 sm:p-5">
              <div className="h-1.5 sm:h-2 bg-muted dark:bg-white/10 rounded-full mb-4 sm:mb-5 overflow-hidden">
                <div className="h-full w-1/2 bg-muted dark:bg-white/5 rounded-full" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-muted dark:bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-10 bg-muted dark:bg-white/10 rounded" />
                    <div className="h-3.5 w-16 bg-muted dark:bg-white/10 rounded" />
                  </div>
                </div>
                <div className="w-8 sm:w-12 h-0.5 bg-muted dark:bg-white/10 rounded-full" />
                <div className="flex items-center gap-2 sm:gap-3 flex-1">
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-muted dark:bg-white/10" />
                  <div className="space-y-1.5">
                    <div className="h-2.5 w-10 bg-muted dark:bg-white/10 rounded" />
                    <div className="h-3.5 w-16 bg-muted dark:bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            </div>
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-5 sm:p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-muted dark:bg-white/10" />
                      <div className="flex-1 space-y-2.5">
                        <div className="h-4 bg-muted dark:bg-white/10 rounded w-1/2" />
                        <div className="h-3 bg-muted dark:bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-muted dark:bg-white/5 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="h-5 bg-muted dark:bg-white/10 rounded w-1/3" />
                  {[1, 2].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-16 w-16 rounded-xl bg-muted dark:bg-white/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted dark:bg-white/10 rounded w-3/4" />
                        <div className="h-3 bg-muted dark:bg-white/5 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                  <div className="h-px bg-gray-100 dark:bg-white/5" />
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-muted dark:bg-white/10 rounded" />
                    <div className="h-5 w-20 bg-muted dark:bg-white/10 rounded" />
                  </div>
                  <div className="h-12 bg-muted dark:bg-white/10 rounded-2xl" />
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 flex items-center justify-center text-foreground dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 hover:border-brand-primary/30 transition-all disabled:opacity-50"
            disabled={isProcessing}
            onClick={() => {
              if (currentStep === "payment") {
                setCurrentStep("address");
              } else {
                router.push(`/${lang}/cart`);
              }
            }}
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black dark:text-white tracking-tight uppercase">
              {dictionary.checkout?.title || 'Checkout'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">
              {currentStep === "address" ? (dictionary.checkout?.selectAddress || "Select your delivery location") : (dictionary.checkout?.choosePayment || "Choose how you want to pay")}
            </p>
          </div>
        </div>

        {/* Progress Bar Card */}
        <div className="bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "50ms" }}>
          {/* Progress bar */}
          <div className="w-full h-1.5 sm:h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden mb-4 sm:mb-5">
            <div
              className="h-full bg-brand-primary rounded-full transition-all duration-700 ease-out"
              style={{ width: currentStep === "address" ? "50%" : "100%" }}
            />
          </div>

          {/* Steps */}
          <div className="flex items-center justify-between gap-2">
            {/* Step 1: Address */}
            <button
              className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
              disabled={isProcessing}
              onClick={() => !isProcessing && setCurrentStep("address")}
            >
              <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ring-1 ${
                currentStep === "payment"
                  ? "bg-brand-primary text-white ring-brand-primary/20 shadow-lg shadow-brand-primary/15"
                  : currentStep === "address"
                    ? "bg-brand-primary text-white ring-brand-primary/20 shadow-lg shadow-brand-primary/15 scale-105"
                    : "bg-gray-100 dark:bg-white/5 text-muted-foreground ring-gray-200/50 dark:ring-white/10"
              }`}>
                {currentStep === "payment" ? (
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                ) : (
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                  currentStep === "address" ? "text-brand-primary" : currentStep === "payment" ? "text-brand-primary" : "text-muted-foreground"
                }`}>
                  {dictionary.checkout?.step || "Step"} 1
                </p>
                <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                  currentStep === "address" ? "dark:text-white text-foreground" : "text-muted-foreground"
                }`}>
                  {dictionary.checkout?.addressStep?.selectAction?.split(' ').slice(0, 2).join(' ') || "Address"}
                </p>
              </div>
            </button>

            {/* Connector */}
            <div className="flex-shrink-0 w-8 sm:w-12 flex items-center justify-center">
              <div className={`w-full h-0.5 rounded-full transition-colors duration-500 ${currentStep === "payment" ? "bg-brand-primary" : "bg-gray-200 dark:bg-white/10"}`} />
            </div>

            {/* Step 2: Payment */}
            <button
              className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0"
              disabled={isProcessing || currentStep === "address"}
              onClick={() => !isProcessing && currentStep === "payment" && setCurrentStep("payment")}
            >
              <div className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ring-1 ${
                currentStep === "payment"
                  ? "bg-brand-primary text-white ring-brand-primary/20 shadow-lg shadow-brand-primary/15 scale-105"
                  : "bg-gray-100 dark:bg-white/5 text-muted-foreground ring-gray-200/50 dark:ring-white/10"
              }`}>
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-colors ${
                  currentStep === "payment" ? "text-brand-primary" : "text-muted-foreground"
                }`}>
                  {dictionary.checkout?.step || "Step"} 2
                </p>
                <p className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                  currentStep === "payment" ? "dark:text-white text-foreground" : "text-muted-foreground"
                }`}>
                  {dictionary.checkout?.chooseProvider?.split(' ').slice(0, 2).join(' ') || "Payment"}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 animate-in fade-in duration-300">
            <div className="h-5 w-5 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold">!</span>
            </div>
            <p className="font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 items-start">
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: "100ms" }}>
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
