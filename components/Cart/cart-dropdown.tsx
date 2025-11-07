"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import Image from "next/image";
import { toast } from "sonner";

import { ShoppingCartIcon } from "../icons";
import { Badge as ShadCnBadge } from "../ui/badge";

import HeaderCartButton from "./header-cart-button";

import { useCartStore } from "@/app/context/cartContext";
import { useUser } from "@/app/context/userContext";

const fmt = new Intl.NumberFormat("ka-GE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartDropdown() {
  const { user } = useUser();
  const router = useRouter();

  const cart = useCartStore((s) => s.cart);
  const cartLen = useCartStore((s) => s.cart.length);
  const totalQuantity = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef(cartLen);
  const [cartChanged, setCartChanged] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (cartLen > 0 && cartLen !== quantityRef.current) {
      quantityRef.current = cartLen;
      setCartChanged(true);
    }
  }, [cartLen, isOpen]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && e.target instanceof Node && !dropdownRef.current.contains(e.target)) onClose();
    };

    document.addEventListener("mousedown", clickOutside);

    return () => document.removeEventListener("mousedown", clickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!cartChanged) return;
    const t = setTimeout(() => setCartChanged(false), 300);

    return () => clearTimeout(t);
  }, [cartChanged]);

  const handleClickCart = () => (isOpen ? onClose() : onOpen());

  const handleCheckout = () => {
    if (!user) {
      toast.error("გთხოვთ, ჯერ გაიაროთ ავტორიზაცია");

      return;
    }
    router.push("/cart");
    onClose();
  };

  return (
    <div ref={dropdownRef} className="relative">
      <HeaderCartButton className="bg-transparent" onClick={handleClickCart} />

      <div
        className={`absolute right-0 top-12 w-[380px] md:w-[420px] transform transition-all duration-200 ease-out z-50
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
      >
        <Card className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
          {/* header (compact) */}
          <CardHeader className="pb-2 pt-3 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-sm font-semibold text-text-light dark:text-text-lightdark">Shopping Cart</h1>
              <ShadCnBadge className="bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-lightdark border border-gray-200 dark:border-gray-700 text-[11px]">
                {mounted ? totalQuantity : 0} items
              </ShadCnBadge>
            </div>
          </CardHeader>

          {cartLen === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 px-4 bg-white dark:bg-gray-900">
              <ShoppingCartIcon className="h-12 w-12 text-gray-300 dark:text-gray-700 mb-2" />
              <p className="text-sm font-medium text-text-light dark:text-text-lightdark">კალათა ცარიელია</p>
              <p className="text-xs mt-1 text-text-subtle dark:text-text-subtledark">დაამატეთ პროდუქტები შესყიდვისთვის</p>
            </div>
          ) : (
            <>
              {/* body (compact) */}
              <CardBody className="px-4 py-3 max-h-[30vh] overflow-y-auto">
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div
                        key={`${item.id}-${item.variantKey ?? ""}`}
                        className="rounded-xl bg-gray-50/80 dark:bg-gray-800/40 p-2.5 border border-gray-100 dark:border-gray-800"
                      >
                        <div className="grid grid-cols-[56px_1fr_auto] gap-3 items-center">
                          {/* image 56x56 */}
                          <div className="relative">
                            <div className="relative overflow-hidden rounded-lg">
                              <Image
                                alt={item.name || "Product image"}
                                className="object-cover"
                                height={56}
                                src={item.image || "/placeholder.png"}
                                width={56}
                              />
                            </div>
                          </div>

                          {/* title + price */}
                          <div className="min-w-0">
                            <h4 className="text-[13px] font-semibold leading-tight truncate text-text-light dark:text-text-lightdark">
                              {item.name}
                            </h4>

                            {/* facets (tiny, single line wrap) */}
                            {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.selectedFacets).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[10px] rounded-md px-1.5 py-0.5 bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                                  >
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="mt-1.5 flex items-center gap-2">
                              <span className="text-sm font-bold text-text-light dark:text-text-lightdark">
                                {fmt.format(item.price)} ₾
                              </span>
                              {item.discount > 0 && (
                                <>
                                  <span className="text-[11px] line-through text-text-subtle dark:text-text-subtledark">
                                    {item.originalPrice} ₾
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* right controls: trash + qty pill */}
                          <div className="flex flex-col items-end gap-2">
                            <button
                              aria-label="Remove item"
                              className="h-7 w-7 rounded-lg text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition"
                              title="Remove"
                              onClick={() => removeFromCart(item.id, item.variantKey)}
                            >
                              <span className="text-base leading-none">🗑️</span>
                            </button>

                            {/* qty pill (keeps your brand orange as-is) */}
                            <div className="inline-flex items-center h-8 rounded-full bg-brand-primary text-white shadow-sm">
                              <button
                                className="h-8 w-8 rounded-l-full hover:bg-white/10 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                                onClick={() =>
                                  updateCartItem(item.id, Math.max(1, item.quantity - 1), item.variantKey)
                                }
                              >
                                <span className="text-sm font-bold">−</span>
                              </button>
                              <div className="w-9 h-8 flex items-center justify-center text-xs font-extrabold">
                                {item.quantity}
                              </div>
                              <button
                                className="h-8 w-8 rounded-r-full hover:bg-white/10"
                                onClick={() => updateCartItem(item.id, item.quantity + 1, item.variantKey)}
                              >
                                <span className="text-sm font-bold">+</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </CardBody>

              {/* footer compact */}
              <CardFooter className="sticky bottom-0 z-10 px-4  bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between rounded-lg ">
                    <span className="text-sm font-semibold text-text-light dark:text-text-lightdark" />
                    <span className="text-xl font-extrabold text-text-light dark:text-text-lightdark">
                      {fmt.format(subtotal)} ₾
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      as={Link}
                      className="flex-1 h-10 rounded-lg font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg"
                      href="/cart"
                      onPress={onClose}
                    >
                      <span className="text-sm">ნახვა</span>
                      {/* <ShadCnBadge className="ml-2 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-lightdark border border-gray-300 dark:border-gray-600 text-[11px]">
                        {mounted ? totalQuantity : 0}
                      </ShadCnBadge> */}
                    </Button>
                    {/* <Button
                      className="flex-1 h-10 rounded-lg font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg"
                      onPress={handleCheckout}
                    >
                      <span className="text-sm">ყიდვა</span>
                    </Button> */}
                  </div>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
