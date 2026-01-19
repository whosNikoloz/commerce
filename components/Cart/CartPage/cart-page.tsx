"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import CartItems from "./CartItems";

import { useCartStore } from "@/app/context/cartContext";
import { getCachedMerchantType } from "@/app/context/tenantContext";
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

      if (merchantType !== "FINA") {
        setAvailability({});
        setLoading(false);
        
        return;
      }

      if (productIds.length === 0) {
        setAvailability({});

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 h-14 w-14" />
              <div className="space-y-2">
                <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32" />
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24" />
              </div>
            </div>
            <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-40" />
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
                  <div className="flex gap-4">
                    <div className="h-24 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:sticky lg:top-6 h-fit">
              <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
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

  if (cartLen === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <CartHeader itemCount={cartLen} />

        {loading && (
          <div className="mb-4 text-sm text-text-subtle dark:text-text-subtledark">
            {dictionary.cart.checkingStock}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems availability={availability} loading={loading} />
          </div>
          <div className="lg:sticky lg:top-6 h-fit">
            <CartSummary autoShowLoginPrompt={showLoginPrompt} />
          </div>
        </div>
      </div>
    </div>
  );
}
