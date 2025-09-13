"use client";

import CartHeader from "./CartHeader";
import CartSummary from "./CartSummary";
import EmptyCart from "./EmptyCart";
import CartItems from "./CartItems";

import { useCartStore } from "@/app/context/cartContext";

export default function CartPage() {
  const cartLen = useCartStore((s) => s.getCount());

  if (cartLen === 0) return <EmptyCart />;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <CartHeader itemCount={cartLen} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CartItems />
          </div>
          <div className="lg:sticky lg:top-6 h-fit">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
