"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import CartItems from "./CartItems";

import { useCartStore } from "@/app/context/cartContext";
import { getProductRestsByIds } from "@/app/api/services/productService";

export type AvailabilityMap = Record<string, number>;

export default function CartPage() {
  const searchParams = useSearchParams();
  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.getCount());

  const [availability, setAvailability] = useState<AvailabilityMap>({});
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const productIds = useMemo(
    () => Array.from(new Set((cart ?? []).map((it: any) => String(it.id)))),
    [cart]
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (productIds.length === 0) {
        setAvailability({});

        return;
      }
      setLoading(true);
      try {
        const res = await getProductRestsByIds({ prods: productIds });
        const map: AvailabilityMap = {};

        if (!res.ex && Array.isArray(res.summedRests)) {
          for (const r of res.summedRests) map[String(r.id)] = Number(r.totalRest ?? 0);
        }
        if (!cancelled) setAvailability(map);
      } catch {
        if (!cancelled) setAvailability({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [productIds.join("|")]);

  // Check for login requirement from URL parameter
  useEffect(() => {
    const loginRequired = searchParams.get("login");

    if (loginRequired === "required") {
      setShowLoginPrompt(true);
    }
  }, [searchParams]);

  if (cartLen === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-20">
        <CartHeader itemCount={cartLen} />

        {loading && (
          <div className="mb-4 text-sm text-text-subtle dark:text-text-subtledark">
            მარაგების შემოწმება…
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems availability={availability} />
          </div>
          <div className="lg:sticky lg:top-6 h-fit">
            <CartSummary autoShowLoginPrompt={showLoginPrompt} />
          </div>
        </div>
      </div>
    </div>
  );
}
