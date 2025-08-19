"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/app/context/cartContext";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

export default function CartItems() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (
      cart?.length !== undefined &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length]);

  const handleQuantityChange = (id: string, currentQty: number, delta: number /*, variantKey?: string */) => {
    const newQuantity = currentQty + delta;
    if (newQuantity >= 1) {
      // თუ კონტექსტში გაქვს მესამე არგუმენტი (variantKey), გადააწოდე აქაც:
      // updateCartItem(id, newQuantity, variantKey)
      updateCartItem(id, newQuantity);
    }
  };

  return (
    <div className="rounded-2xl border border-brand-muted/60 bg-white dark:bg-brand-muteddark dark:border-brand-muteddark/60 shadow-sm p-4 md:p-6">
      <div className="space-y-6">
        {cart.map((item) => (
          <div
            key={`${item.id}-${(item as any).variantKey ?? ""}`}
            className="grid grid-cols-[auto,1fr,auto] gap-4 md:gap-6 items-center border-b last:border-none border-brand-muted/50 dark:border-text-subtledark/40 pb-6"
          >
            {/* სურათი */}
            <Link className="shrink-0" href="#">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg ring-1 ring-brand-muted/60 bg-white">
                <Image
                  alt={item.name}
                  height={80}
                  width={80}
                  src={item.image}
                  className="object-cover"
                />
              </div>
            </Link>

            {/* შუა სვეტი: სახელი + არჩეული ფასეტები + ქმედებები */}
            <div className="min-w-0">
              <Link
                className="block text-base font-medium text-text-light hover:underline"
                href="#"
                title={item.name}
              >
                <span className="line-clamp-2">{item.name}</span>
              </Link>

              {/* არჩეული ფასეტები */}
              {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.entries(item.selectedFacets).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-[11px] rounded-full border px-2 py-0.5 bg-gray-50 text-gray-700
                                 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                    >
                      {k}: {v}
                    </span>
                  ))}
                </div>
              )}

              {/* ქმედებები */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <button
                  type="button"
                  className="inline-flex items-center text-text-subtle hover:text-text-light transition"
                >
                  <svg
                    aria-hidden="true"
                    className="me-1.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  ჩანიშვნა
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // removeFromCart(item.id, (item as any).variantKey)
                    removeFromCart(item.id);
                  }}
                  className="inline-flex items-center text-red-600 hover:text-red-700 transition"
                >
                  <svg
                    aria-hidden="true"
                    className="me-1.5 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M6 18 17.94 6M18 18 6.06 6"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    />
                  </svg>
                  წაშლა
                </button>
              </div>
            </div>

            {/* მარჯვენა სვეტი: რაოდენობა + ფასი */}
            <div className="flex items-center gap-6 justify-end">
              <div className="flex items-center rounded-lg border border-brand-muted/70 dark:border-text-subtledark/40 bg-brand-surface dark:bg-brand-muteddark/50">
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-l-md hover:bg-brand-muted/80 dark:hover:bg-brand-muteddark/70 focus:outline-none"
                  type="button"
                  aria-label="რაოდენობის შემცირება"
                  onClick={() => handleQuantityChange(item.id, item.quantity, -1 /*, (item as any).variantKey */)}
                >
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-text-light dark:text-text-lightdark"
                    fill="none"
                    viewBox="0 0 18 2"
                  >
                    <path d="M1 1h16" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
                  </svg>
                </button>
                <span className="w-10 text-center text-sm font-medium text-text-light dark:text-text-lightdark bg-transparent">
                  {item.quantity}
                </span>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-r-md hover:bg-brand-muted/80 dark:hover:bg-brand-muteddark/70 focus:outline-none"
                  type="button"
                  aria-label="რაოდენობის გაზრდა"
                  onClick={() => handleQuantityChange(item.id, item.quantity, 1 /*, (item as any).variantKey */)}
                >
                  <svg
                    aria-hidden="true"
                    className="h-3.5 w-3.5 text-text-light dark:text-text-lightdark"
                    fill="none"
                    viewBox="0 0 18 18"
                  >
                    <path
                      d="M9 1v16M1 9h16"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>

              <div className="text-end w-28">
                <p className="text-base font-semibold text-text-light">
                  {fmt(item.price)}
                </p>
                {item.quantity > 1 && (
                  <p className="text-xs text-text-subtle">
                    {fmt(item.price)} × {item.quantity}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
