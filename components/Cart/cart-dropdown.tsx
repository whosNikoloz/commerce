"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import Link from "next/link";
import { useDisclosure } from "@heroui/modal";

import { ShoppingCartIcon } from "../icons";
import { useCart } from "@/app/context/cartContext";

export default function CartDropdown() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef(cart?.length);
  const [cartChanged, setCartChanged] = useState(false);

  useEffect(() => {
    if (cart?.length && cart.length !== quantityRef.current && cart.length > 0) {
      quantityRef.current = cart.length;
      setCartChanged(true);
    }
  }, [cart?.length, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleClickCart = () => {
    if (isOpen) { onClose(); return; }
    onOpen();
  };

  useEffect(() => {
    if (cartChanged) {
      const timer = setTimeout(() => setCartChanged(false), 500);
      return () => clearTimeout(timer);
    }
  }, [cartChanged]);

  return (
    <div ref={dropdownRef} className="relative">
      <Badge
        className={`border-0 absolute top-2 right-2 ${cartChanged ? "hidden" : ""}`}
        color="danger"
        content={totalQuantity}
        size="sm"
        variant="shadow"
      >
        <Button
          isIconOnly
          className={`relative rounded-full bg-transparent ${cartChanged ? "animate-ping" : ""}`}
          variant="solid"
          onPress={handleClickCart}
        >
          <ShoppingCartIcon size={25} />
        </Button>
      </Badge>

      <div
        className={`absolute right-0 top-14 w-96 transform transition-all duration-200 ${isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
      >
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <h1 className="text-lg font-semibold">Shopping Cart</h1>
          </CardHeader>

          <div className="h-min">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingCartIcon className="h-12 w-12 mb-2 opacity-20" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              // ✅ scrollable სხეული, თუ ნივთები ბევრია
              <CardBody className="px-2 max-h-[70vh] overflow-y-auto">
                {cart.map((item, index) => (
                  <div key={`${item.id}-${(item as any).variantKey ?? ""}`}>
                    <div className="flex py-4 px-2">
                      <img
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-gray-700"
                        src={item.image}
                      />

                      <div className="ml-4 flex-1 min-w-0">
                        <h4 className="font-medium line-clamp-2">{item.name}</h4>

                        {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {Object.entries(item.selectedFacets).map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[11px] rounded-full border px-2 py-0.5
                                           bg-gray-50 text-gray-700 border-gray-200
                                           dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-lg font-bold">{item.price} ₾</span>
                          {item.discount > 0 && (
                            <>
                              <span className="text-sm line-through text-muted-foreground">
                                {item.originalPrice} ₾
                              </span>
                              <Badge className="text-[10px]">-{item.discount}%</Badge>
                            </>
                          )}
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            isIconOnly
                            className="h-8 w-8"
                            variant="solid"
                            onPress={() =>
                              updateCartItem(item.id, Math.max(1, item.quantity - 1), (item as any).variantKey)
                            }
                            isDisabled={item.quantity <= 1}
                          >
                            -
                          </Button>

                          <span className="w-8 text-center">{item.quantity}</span>

                          <Button
                            isIconOnly
                            className="h-8 w-8"
                            variant="solid"
                            onPress={() =>
                              updateCartItem(item.id, item.quantity + 1, (item as any).variantKey)
                            }
                          >
                            +
                          </Button>

                          <Button
                            isIconOnly
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            variant="ghost"
                            onPress={() => removeFromCart(item.id, (item as any).variantKey)}
                            aria-label="Remove item"
                            title="Remove item"
                          >
                            X
                          </Button>
                        </div>
                      </div>
                    </div>

                    {index < cart.length - 1 && (
                      <hr className="border-gray-200 dark:border-gray-700" />
                    )}
                  </div>
                ))}
              </CardBody>
            )}
          </div>

          {cart.length > 0 && (
            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                <span className="text-lg font-medium">სულ:</span>
                <span className="text-xl font-bold">{totalPrice} ₾</span>
              </div>
              <div className="flex gap-2 w-full">
                <Button as={Link} className="flex-1" href="/cart" variant="ghost" onPress={onClose}>
                  ნახვა ({totalQuantity})
                </Button>
                <Button className="flex-1">ყიდვა</Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
