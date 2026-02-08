"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import CartItems from "./CartItems";
import CartSuggestions from "../cart-suggestions";

import { useCartStore } from "@/app/context/cartContext";
import { getCachedMerchantType } from "@/app/api/services/integrationService";
import { getProductRestsByIds } from "@/app/api/services/productService";
import { useGA4 } from "@/hooks/useGA4";
import { useDictionary } from "@/app/context/dictionary-provider";

export type AvailabilityMap = Record<string, number>;

export default function CartPage() {
  const dictionary = useDictionary();
  const searchParams = useSearchParams();
  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.getCount());
  const { trackCartView } = useGA4();

  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [loading, setLoading] = useState(false);
  const [stockEnabled, setStockEnabled] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const productIds = useMemo(
    () => Array.from(new Set((cart ?? []).map((it: any) => String(it.id)))),
    [cart]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Only check availability for FINA merchants
      const merchantType = getCachedMerchantType();

      setStockEnabled(merchantType === "FINA");

      if (merchantType !== "FINA") {
        setAvailability({});
        setLoading(false);

        return;
      }

      if (productIds.length === 0) {
        setAvailability({});
        setLoading(false);

        return;
      }

      const TIMEOUT_MS = 8000;
      const MAX_RETRIES = 3;
      let attempt = 0;

      setLoading(true);

      while (attempt < MAX_RETRIES && !cancelled) {
        attempt++;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

        try {
          const res = await getProductRestsByIds({ prods: productIds });

          clearTimeout(timeout);

          const map: AvailabilityMap = {};

          // Default all requested products to 0 so UI doesn't stay in "checking" state
          for (const id of productIds) {
            map[String(id)] = 0;
          }

          if (!res.ex && Array.isArray(res.summedRests)) {
            for (const r of res.summedRests) map[String(r.id)] = Number(r.totalRest ?? 0);
          }

          if (!cancelled) {
            setAvailability(map);
            setLoading(false);
          }

          return; // success
        } catch (err: any) {
          clearTimeout(timeout);

          const isAbort = err?.name === "AbortError";
          const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

          if (attempt >= MAX_RETRIES || isOffline || isAbort) {
            if (!cancelled) {
              setAvailability({});
              setLoading(false);
            }

            return;
          }

          // Exponential backoff with jitter
          const backoff = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 200);

          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }

    load();

    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (!cancelled) load();
    }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(refreshInterval);
    };
  }, [productIds.join("|")]);

  // Check for login requirement from URL parameter
  useEffect(() => {
    const loginRequired = searchParams.get("login");

    if (loginRequired === "required") {
      setShowLoginPrompt(true);
    }
  }, [searchParams]);

  // Track view cart event
  useEffect(() => {
    if (cart && cart.length > 0) {
      trackCartView(cart);
    }
  }, [cart.length, trackCartView]);

  if (!mounted) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 animate-pulse">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-2xl bg-muted dark:bg-white/10" />
              <div className="space-y-2">
                <div className="h-7 sm:h-8 bg-muted dark:bg-white/10 rounded-lg w-28 sm:w-36" />
                <div className="h-3.5 bg-muted dark:bg-white/5 rounded w-20 sm:w-24" />
              </div>
            </div>
            <div className="h-10 bg-muted dark:bg-white/10 rounded-xl w-36 sm:w-44" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 sm:w-1.5 h-full bg-muted dark:bg-white/10 rounded-l-2xl sm:rounded-l-3xl" />
                  <div className="pl-4 sm:pl-6 pr-3 sm:pr-5 py-3.5 sm:py-5">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-xl sm:rounded-2xl bg-muted dark:bg-white/10 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 sm:h-5 bg-muted dark:bg-white/10 rounded-lg w-3/4" />
                        <div className="flex gap-1.5">
                          <div className="h-5 w-16 bg-muted dark:bg-white/10 rounded-full" />
                          <div className="h-5 w-14 bg-muted dark:bg-white/10 rounded-full" />
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="h-5 w-20 bg-muted dark:bg-white/10 rounded" />
                          <div className="h-8 w-24 bg-muted dark:bg-white/10 rounded-xl" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-6 h-fit space-y-4">
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 overflow-hidden">
                <div className="px-4 sm:px-6 pt-5 sm:pt-6 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-muted dark:bg-white/10" />
                    <div className="h-5 w-32 bg-muted dark:bg-white/10 rounded-lg" />
                  </div>
                </div>
                <div className="px-4 sm:px-6 pb-5 sm:pb-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                      <div className="h-4 w-24 bg-muted dark:bg-white/10 rounded" />
                      <div className="h-4 w-16 bg-muted dark:bg-white/10 rounded" />
                    </div>
                  ))}
                  <div className="h-px bg-gray-100 dark:bg-white/5" />
                  <div className="flex justify-between">
                    <div className="h-5 w-16 bg-muted dark:bg-white/10 rounded" />
                    <div className="h-5 w-20 bg-muted dark:bg-white/10 rounded" />
                  </div>
                  <div className="h-11 sm:h-12 bg-muted dark:bg-white/10 rounded-xl sm:rounded-2xl mt-2" />
                  <div className="h-10 sm:h-11 bg-muted dark:bg-white/10 rounded-xl sm:rounded-2xl" />
                </div>
              </div>
              <div className="bg-white dark:bg-gray-900/80 rounded-2xl sm:rounded-3xl border border-gray-200 dark:border-white/10 p-4 sm:p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted dark:bg-white/10" />
                    <div className="h-3.5 w-32 bg-muted dark:bg-white/10 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartLen === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <CartHeader itemCount={cartLen} />

        {stockEnabled && loading && (
          <div className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-gray-900/80 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 animate-pulse">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-ping" />
            {dictionary.cart.checkingStock}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2">
            <CartItems availability={availability} loading={loading} stockEnabled={stockEnabled} />
            <div className="hidden lg:block">
              <CartSuggestions />
            </div>
          </div>
          <div className="lg:sticky lg:top-6 h-fit">
            <CartSummary autoShowLoginPrompt={showLoginPrompt} />
          </div>
        </div>

        {/* Mobile View Suggestions - shown below everything */}
        <div className="lg:hidden">
          <CartSuggestions />
        </div>
      </div>
    </div>
  );
}
