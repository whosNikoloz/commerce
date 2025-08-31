"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import Image from "next/image";

import { ShoppingCartIcon } from "../icons";
import { Badge as ShadCnBadge } from "../ui/badge";

import HeaderCartButton from "./header-cart-button";

import { useCartStore } from "@/app/context/cartContext";

const fmt = new Intl.NumberFormat("ka-GE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function CartDropdown() {
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

  // small "ping" when line count changes
  useEffect(() => {
    if (cartLen > 0 && cartLen !== quantityRef.current) {
      quantityRef.current = cartLen;
      setCartChanged(true);
    }
  }, [cartLen, isOpen]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        e.target instanceof Node &&
        !dropdownRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", clickOutside);

    return () => document.removeEventListener("mousedown", clickOutside);
  }, [onClose]);

  useEffect(() => {
    if (!cartChanged) return;
    const t = setTimeout(() => setCartChanged(false), 450);

    return () => clearTimeout(t);
  }, [cartChanged]);

  const handleClickCart = () => (isOpen ? onClose() : onOpen());

  return (
    <div ref={dropdownRef} className="relative">
      <HeaderCartButton onClick={handleClickCart} />

      <div
        className={`absolute right-0 top-14 w-[440px] md:w-[500px] transform transition-all duration-300 ease-out z-50
        ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}`}
      >
        <Card className="overflow-hidden rounded-3xl border-0 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-default-50/95">
          <CardHeader className="pb-4 pt-6 px-6 bg-gradient-to-r from-default-50/80 to-default-100/60 dark:from-default-100/30 dark:to-default-200/20">
            <div className="flex items-center justify-between w-full">
              <h1 className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                Shopping Cart
              </h1>
              <ShadCnBadge className="bg-primary/10 text-primary-600 dark:text-primary-400">
                {totalQuantity} items
              </ShadCnBadge>
            </div>
          </CardHeader>

          {cartLen === 0 ? (
            <div className="flex flex-col items-center justify-center h-52 text-default-500 px-6">
              <div className="relative mb-4">
                <ShoppingCartIcon className="h-16 w-16 opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-primary/5 rounded-full" />
              </div>
              <p className="text-base font-medium">კალათა ცარიელია</p>
              <p className="text-sm mt-1 opacity-70">დაამატეთ პროდუქტები შესყიდვისთვის</p>
            </div>
          ) : (
            <>
              {/* Enhanced Scroll area */}
              <CardBody className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${item.variantKey ?? ""}`}
                      className={`group relative ${index !== 0 ? "pt-6 border-t border-default-200/60 dark:border-default-100/15" : ""}`}
                    >
                      <div className="grid grid-cols-[100px_1fr] gap-4">
                        {/* Enhanced Product Image */}
                        <div className="relative">
                          <div className="relative overflow-hidden rounded-2xl">
                            <Image
                              alt={item.name || "Product image"}
                              className="object-cover transition-transform duration-200 group-hover:scale-105"
                              height={100}
                              src={item.image || "/placeholder.svg"}
                              width={100}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          </div>
                        </div>

                        {/* Enhanced Product Info */}
                        <div className="flex flex-col justify-between min-w-0">
                          <div>
                            <h4 className="font-semibold text-base leading-tight line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>

                            {/* Enhanced Facets */}
                            {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mb-3">
                                {Object.entries(item.selectedFacets).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-xs rounded-xl px-3 py-1 font-medium
                                      bg-gradient-to-r from-default-100 to-default-50 
                                      text-default-700 border border-default-200/50
                                      dark:from-default-100/30 dark:to-default-50/20 
                                      dark:text-default-300 dark:border-default-100/20"
                                  >
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Enhanced Price */}
                            <div className="flex items-center gap-3 mb-3">
                              <span className="text-lg font-bold text-primary">
                                {fmt.format(item.price)} ₾
                              </span>
                              {item.discount > 0 && (
                                <>
                                  <span className="text-sm line-through text-default-400">
                                    {item.originalPrice} ₾
                                  </span>
                                  <ShadCnBadge className="bg-danger/10 text-danger-600 dark:text-danger-400 text-xs font-bold px-2">
                                    -{item.discount}%
                                  </ShadCnBadge>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Enhanced Controls Row */}
                          <div className="flex items-center justify-between">
                            {/* Enhanced Quantity controls */}
                            <div className="inline-flex items-center rounded-2xl bg-default-100/80 dark:bg-default-100/30 ring-1 ring-default-200/50 dark:ring-default-100/20 overflow-hidden">
                              <Button
                                isIconOnly
                                className="h-9 w-9 rounded-l-2xl border-0 bg-transparent hover:bg-default-200/60 dark:hover:bg-default-100/40 transition-colors"
                                isDisabled={item.quantity <= 1}
                                size="sm"
                                variant="light"
                                onPress={() =>
                                  updateCartItem(
                                    item.id,
                                    Math.max(1, item.quantity - 1),
                                    item.variantKey,
                                  )
                                }
                              >
                                <span className="text-lg leading-none">–</span>
                              </Button>
                              <div className="flex items-center justify-center w-12 h-9 bg-white/60 dark:bg-default-50/20 border-x border-default-200/50 dark:border-default-100/20">
                                <span className="text-sm font-bold select-none">
                                  {item.quantity}
                                </span>
                              </div>
                              <Button
                                isIconOnly
                                className="h-9 w-9 rounded-r-2xl border-0 bg-transparent hover:bg-default-200/60 dark:hover:bg-default-100/40 transition-colors"
                                size="sm"
                                variant="light"
                                onPress={() =>
                                  updateCartItem(item.id, item.quantity + 1, item.variantKey)
                                }
                              >
                                <span className="text-lg leading-none">+</span>
                              </Button>
                            </div>

                            {/* Enhanced Remove Button */}
                            <Button
                              isIconOnly
                              aria-label="Remove item"
                              className="h-9 w-9 rounded-2xl text-danger-500 hover:bg-danger/10 dark:hover:bg-danger/20 transition-all duration-200 opacity-60 group-hover:opacity-100"
                              title="Remove item"
                              variant="light"
                              onPress={() => removeFromCart(item.id, item.variantKey)}
                            >
                              <span className="text-lg leading-none">×</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>

              {/* Enhanced Footer */}
              <CardFooter className="sticky bottom-0 z-10 px-6 py-5 bg-gradient-to-t from-background via-background/95 to-background/80 backdrop-blur-xl border-t border-default-200/60 dark:border-default-100/15">
                <div className="w-full space-y-4">
                  {/* Enhanced Subtotal */}
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-default-50 to-default-100/50 dark:from-default-100/20 dark:to-default-200/10 border border-default-200/30 dark:border-default-100/10">
                    <span className="text-base font-semibold text-default-700 dark:text-default-300">
                      სულ:
                    </span>
                    <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                      {fmt.format(subtotal)} ₾
                    </span>
                  </div>

                  {/* Enhanced Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      as={Link}
                      className="flex-1 h-12 rounded-2xl font-semibold border-2 border-default-300 dark:border-default-200/30 hover:border-default-400 dark:hover:border-default-200/50 transition-all duration-200"
                      href="/cart"
                      variant="bordered"
                      onPress={onClose}
                    >
                      <span>ნახვა</span>
                      <ShadCnBadge className="ml-2 bg-default-200 dark:bg-default-300/30 text-default-700 dark:text-default-300">
                        {totalQuantity}
                      </ShadCnBadge>
                    </Button>
                    <Button
                      className="flex-1 h-12 rounded-2xl font-bold bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                      color="primary"
                    >
                      ყიდვა
                    </Button>
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
