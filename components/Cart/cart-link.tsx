"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";

import { ShoppingCartIcon } from "../icons";

import { useCartStore } from "@/app/context/cartContext";

export default function Cartlink() {
  // pull minimal selectors to avoid unnecessary re-renders
  const cartLen = useCartStore((s) => s.getCount());
  const totalQuantity = useCartStore((s) => s.cart.reduce((acc, item) => acc + item.quantity, 0));

  const quantityRef = useRef(cartLen);
  const [cartChanged, setCartChanged] = useState(false);

  useEffect(() => {
    if (cartLen > 0 && cartLen !== quantityRef.current) {
      quantityRef.current = cartLen;
      setCartChanged(true);
    }
  }, [cartLen]);

  useEffect(() => {
    if (!cartChanged) return;
    const timer = setTimeout(() => setCartChanged(false), 500);

    return () => clearTimeout(timer);
  }, [cartChanged]);

  return (
    <Badge
      className={`border-0 absolute top-2 right-2 ${cartChanged ? "hidden" : ""}`}
      color="danger"
      content={totalQuantity}
      size="sm"
      variant="shadow"
    >
      <Button
        isIconOnly
        as={Link}
        className={`relative rounded-full bg-transparent ${cartChanged ? "animate-ping" : ""}`}
        href="/cart"
        variant="solid"
      >
        <ShoppingCartIcon size={30} />
      </Button>
    </Badge>
  );
}
