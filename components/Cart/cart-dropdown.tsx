import React, { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";

import { ShoppingCartIcon } from "../icons";

import { useCart } from "@/app/context/cartContext";
import Link from "next/link";
import { useDisclosure } from "@heroui/modal";

export default function CartDropdown() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const {isOpen, onOpen,onClose, onOpenChange} = useDisclosure();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (
      cart?.length &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
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
  }, []);

  const totalPrice = cart
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toFixed(2);
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleClickCart = () => {
    if(isOpen){
      onClose();
      return;
    }
    onOpen();
  }

  return (
    <div ref={dropdownRef} className="relative">
      <Badge
        className="border-0 absolute top-2 right-2"
        color="danger"
        content={totalQuantity}
        size="sm"
        variant="shadow"
      >
        <Button
          isIconOnly
          className="relative rounded-full bg-transparent"
          variant="solid"
          onPress={() => handleClickCart()}
        >
          <ShoppingCartIcon size={25} />
        </Button>
      </Badge>

      <div
        className={`absolute right-0 top-14  w-96 transform transition-all duration-200 ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <Card>
          <CardHeader className="pb-3">
            <h1 className="text-lg font-semibold">Shopping Cart</h1>
          </CardHeader>

          <div className="h-min ">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <ShoppingCartIcon className="h-12 w-12 mb-2 opacity-20" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <CardBody className="px-2">
                {cart.map((item, index) => (
                  <div key={item.id}>
                    <div className="flex py-4 px-2">
                      <img
                        alt={item.name}
                        className="h-20 w-20 rounded-lg object-cover"
                        src={item.image}
                      />
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-lg font-bold">
                            {item.price} ₾
                          </span>
                          {item.discount > 0 && (
                            <>
                              <span className="text-sm line-through text-muted-foreground">
                                {item.originalPrice} ₾
                              </span>
                              <Badge className="text-xs">
                                -{item.discount}%
                              </Badge>
                            </>
                          )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Button
                            isIconOnly
                            className="h-8 w-8"
                            variant="solid"
                            onPress={() =>
                              updateCartItem(item.id, item.quantity - 1)
                            }
                          >
                            {/* <Minus className="h-4 w-4" /> */}-
                          </Button>
                          <span className="w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            isIconOnly
                            className="h-8 w-8"
                            variant="solid"
                            onPress={() =>
                              updateCartItem(item.id, item.quantity + 1)
                            }
                          >
                            +{/* <Plus className="h-4 w-4" /> */}
                          </Button>
                          <Button
                            isIconOnly
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            variant="ghost"
                            onPress={() => removeFromCart(item.id)}
                          >
                            {/* <X className="h-4 w-4" /> */}X
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
                <Button as={Link} variant="ghost" onPress={() => onClose()} className="flex-1" href="/cart">
                  ნახვა ({totalQuantity})
                </Button>
                <Button className="flex-1">
                  ყიდვა
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
