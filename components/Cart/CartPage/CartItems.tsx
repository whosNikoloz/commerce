"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X, Heart, Package, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/cartContext";
import type { CartItem as CartItemType } from "@/app/context/cartContext";

const fmt = (n: number) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n);

const toNum = (v: unknown): number => (typeof v === "number" ? v : Number(v ?? 0));

export default function CartItems() {
  const { cart, updateCartItem, removeFromCart } = useCart();

  const items = cart as Array<
    CartItemType & { originalPrice?: number }
  >;

  const saveForLater = (item: CartItemType) => {
    // TODO: სურვილების სია
    console.log("Save for later:", item);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12 rounded-2xl bg-brand-surface border border-brand-muted/60">
          <Package className="h-12 w-12 text-text-subtle mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-light mb-2">კალათა ცარიელია</h3>
          <p className="text-text-subtle mb-6">დაამატე პროდუქტები, რომ დაიწყოს შესყიდვა.</p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl
                       bg-brand-primary hover:bg-brand-primarydark text-white transition-colors"
          >
            დაბრუნება მაღაზიაში
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      {/* თავსართი (დესკტოპი) */}
      <div className="hidden lg:grid grid-cols-[1fr_120px_140px_140px_110px] text-xs uppercase tracking-wide text-text-subtle px-2">
        <span>პროდუქტი</span>
        <span className="text-right">ფასი</span>
        <span className="text-center">რაოდ.</span>
        <span className="text-right">ჯამი</span>
        <span className="text-right">ქმედებები</span>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const price = toNum(item.price);
          const orig = item.originalPrice != null ? toNum(item.originalPrice) : undefined;
          const hasDiscount = typeof orig === "number" && orig > price;
          const percentOff = hasDiscount ? Math.round(((orig! - price) / orig!) * 100) : 0;

          return (
            <div
              key={`${item.id}-${(item as any).variantKey ?? ""}`}
              className="group rounded-2xl border border-brand-muted/60 bg-white dark:bg-brand-muteddark/90
                         shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-4 md:p-5 lg:grid lg:grid-cols-[1fr_120px_140px_140px_110px] lg:items-center lg:gap-4">
                {/* ინფორმაცია */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="relative shrink-0">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 overflow-hidden rounded-xl ring-1 ring-brand-muted/60 bg-white">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                    {hasDiscount && (
                      <div className="absolute -top-2 -right-2 rounded-full bg-red-500 text-white text-[10px] px-2 py-1 font-semibold shadow">
                        -{percentOff}%
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-light leading-tight line-clamp-2">
                      {item.name}
                    </h3>

                    {/* არჩეული ფასეტები როგორც ბეჳები */}
                    {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(item.selectedFacets).map(([k, v]) => (
                          <span
                            key={k}
                            className="inline-flex items-center rounded-full border border-brand-muted/60 bg-brand-surface px-2 py-0.5 text-xs text-text-subtle"
                          >
                            {k}: <span className="ml-1 font-medium text-text-light">{v}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* მობილურზე: ფასი/ჯამი */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-text-subtle lg:hidden">
                      <div>
                        <span>ფასი</span>
                        <div className="font-semibold text-text-light">{fmt(price)}</div>
                        {hasDiscount && <div className="text-xs line-through">{fmt(orig!)}</div>}
                      </div>
                      <div className="text-right">
                        <span>ჯამი</span>
                        <div className="font-semibold text-text-light">
                          {fmt(price * toNum(item.quantity))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ფასი (დესკტოპი) */}
                <div className="hidden lg:block text-right">
                  <div className="font-semibold text-text-light">{fmt(price)}</div>
                  {hasDiscount && (
                    <div className="text-xs text-text-subtle line-through">{fmt(orig!)}</div>
                  )}
                </div>

                {/* რაოდენობა */}
                <div className="mt-3 lg:mt-0 flex lg:justify-center">
                  <div className="flex items-center overflow-hidden rounded-xl border border-brand-muted/70 bg-brand-surface">
                    <button
                      onClick={() =>
                        // updateCartItem(item.id, Math.max(1, toNum(item.quantity) - 1), (item as any).variantKey)
                        updateCartItem(item.id, Math.max(1, toNum(item.quantity) - 1))
                      }
                      disabled={toNum(item.quantity) <= 1}
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-brand-muted/60 disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                      aria-label="რაოდენობის შემცირება"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 text-sm font-medium text-text-light bg-white dark:bg-brand-muteddark/60 min-w-[3rem] text-center">
                      {toNum(item.quantity)}
                    </span>
                    <button
                      onClick={() =>
                        // updateCartItem(item.id, toNum(item.quantity) + 1, (item as any).variantKey)
                        updateCartItem(item.id, toNum(item.quantity) + 1)
                      }
                      className="h-9 w-9 inline-flex items-center justify-center hover:bg-brand-muted/60 transition-colors"
                      aria-label="რაოდენობის გაზრდა"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* ჯამი (დესკტოპი) */}
                <div className="hidden lg:block text-right font-semibold text-text-light">
                  {fmt(price * toNum(item.quantity))}
                </div>

                {/* ქმედებები */}
                <div className="mt-3 lg:mt-0 flex items-center justify-end gap-3">
                  <button
                    onClick={() => saveForLater(item)}
                    className="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-brand-primary transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    შენახვა
                  </button>
                  <button
                    onClick={() => {
                      // removeFromCart(item.id, (item as any).variantKey)
                      removeFromCart(item.id);
                    }}
                    className="inline-flex items-center gap-2 text-sm text-text-subtle hover:text-red-600 transition-colors"
                    aria-label="წაშლა"
                    title="წაშლა"
                  >
                    <Trash2 className="h-4 w-4" />
                    წაშლა
                  </button>

                  {/* კომპაქტური X (დესკტოპზე) */}
                  <button
                    onClick={() => {
                      // removeFromCart(item.id, (item as any).variantKey)
                      removeFromCart(item.id);
                    }}
                    className="ml-1 hidden lg:inline-flex p-2 rounded-full text-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors group-hover:opacity-100"
                    aria-label="წაშლა"
                    title="წაშლა"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:block h-2" />
    </div>
  );
}
