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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        <HeaderCartButton onClick={handleClickCart} className="bg-transparent"/>

        <div
          className={`absolute right-0 top-14 w-[440px] md:w-[500px] transform transition-all duration-300 ease-out z-50
          ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-3 pointer-events-none"}`}
        >
          {/* Card surface fully tied to brand surface */}
          <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
            {/* Header with clean design */}
            <CardHeader className="pb-4 pt-6 px-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between w-full">
                <h1 className="text-lg font-bold text-text-light dark:text-text-lightdark">
                  Shopping Cart
                </h1>
                <ShadCnBadge className="bg-gray-100 dark:bg-gray-800 text-text-light dark:text-text-lightdark border border-gray-200 dark:border-gray-700">
                  {mounted ? totalQuantity : 0} items
                </ShadCnBadge>
              </div>
            </CardHeader>

            {cartLen === 0 ? (
              <div className="flex flex-col items-center justify-center h-52 px-6 bg-white dark:bg-gray-900">
                <div className="relative mb-4">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-300 dark:text-gray-700" />
                </div>
                <p className="text-base font-medium text-text-light dark:text-text-lightdark">
                  კალათა ცარიელია
                </p>
                <p className="text-sm mt-1 text-text-subtle dark:text-text-subtledark">
                  დაამატეთ პროდუქტები შესყიდვისთვის
                </p>
              </div>
            ) : (
              <>
                {/* Scroll area */}
                <CardBody className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                  <div className="space-y-6">
                    {cart.map((item, index) => (
                      <div
                        key={`${item.id}-${item.variantKey ?? ""}`}
                        className={`group relative ${
                          index !== 0
                            ? "pt-6 border-t border-gray-200 dark:border-gray-800"
                            : ""
                        }`}
                      >
                        <div className="grid grid-cols-[100px_1fr] gap-4">
                          {/* Image */}
                          <div className="relative">
                            <div className="relative overflow-hidden rounded-2xl">
                              <Image
                                alt={item.name || "Product image"}
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                                height={100}
                                src={item.image || "/placeholder.png"}
                                width={100}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex flex-col justify-between min-w-0">
                            <div>
                              <h4 className="font-semibold text-base leading-tight line-clamp-2 mb-2 text-text-light dark:text-text-lightdark group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                                {item.name}
                              </h4>

                              {/* Facets */}
                              {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                  {Object.entries(item.selectedFacets).map(([k, v]) => (
                                    <span
                                      key={k}
                                      className="text-xs rounded-lg px-2.5 py-1 font-medium
                                        bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300
                                        border border-gray-200 dark:border-gray-700"
                                    >
                                      {k}: {v}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Price */}
                              <div className="flex items-center gap-3 mb-3">
                                <span className="text-lg font-bold text-text-light dark:text-text-lightdark">
                                  {fmt.format(item.price)} ₾
                                </span>
                                {item.discount > 0 && (
                                  <>
                                    <span className="text-sm line-through text-text-subtle dark:text-text-subtledark">
                                      {item.originalPrice} ₾
                                    </span>
                                    <ShadCnBadge className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold px-2">
                                      -{item.discount}%
                                    </ShadCnBadge>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="flex items-center justify-between">
                              {/* Qty controls */}
                              <div className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                <Button
                                  isIconOnly
                                  className="h-9 w-9 rounded-l-lg border-0 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                                  <span className="text-lg leading-none text-text-light dark:text-text-lightdark">
                                    –
                                  </span>
                                </Button>
                                <div className="flex items-center justify-center w-12 h-9 bg-white dark:bg-gray-900 border-x border-gray-200 dark:border-gray-700">
                                  <span className="text-sm font-bold select-none text-text-light dark:text-text-lightdark">
                                    {item.quantity}
                                  </span>
                                </div>
                                <Button
                                  isIconOnly
                                  className="h-9 w-9 rounded-r-lg border-0 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                  size="sm"
                                  variant="light"
                                  onPress={() =>
                                    updateCartItem(item.id, item.quantity + 1, item.variantKey)
                                  }
                                >
                                  <span className="text-lg leading-none text-text-light dark:text-text-lightdark">
                                    +
                                  </span>
                                </Button>
                              </div>

                              {/* Remove */}
                              <Button
                                isIconOnly
                                aria-label="Remove item"
                                className="h-9 w-9 rounded-2xl text-red-500 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition-all duration-200 opacity-60 group-hover:opacity-100"
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

                {/* Footer */}
                <CardFooter className="sticky bottom-0 z-10 px-6 py-5 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                  <div className="w-full space-y-4">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <span className="text-base font-semibold text-text-light dark:text-text-lightdark">
                        სულ:
                      </span>
                      <span className="text-2xl font-black text-text-light dark:text-text-lightdark">
                        {fmt.format(subtotal)} ₾
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button
                        as={Link}
                        className="flex-1 h-12 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-text-light dark:text-text-lightdark hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                        href="/cart"
                        variant="bordered"
                        onPress={onClose}
                      >
                        <span>ნახვა</span>
                        <ShadCnBadge className="ml-2 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-lightdark border border-gray-300 dark:border-gray-600">
                          {mounted ? totalQuantity : 0}
                        </ShadCnBadge>
                      </Button>
                      <Button className="flex-1 h-12 rounded-xl font-bold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]">
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
