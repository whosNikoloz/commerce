"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";

import { ShoppingCartIcon } from "../icons";

import { useCartStore } from "@/app/context/cartContext";
import { useCartUI } from "@/app/context/cart-ui";
import { useDictionary } from "@/app/context/dictionary-provider";

interface CartlinkProps {
  showLabel?: boolean;
}

export default function Cartlink({ showLabel = false }: CartlinkProps = {}) {
  // pull minimal selectors to avoid unnecessary re-renders
  const cartLen = useCartStore((s) => s.getCount());
  const totalQuantity = useCartStore((s) => s.cart.reduce((acc, item) => acc + item.quantity, 0));
  const { bottomNavCartRef } = useCartUI();
  const dictionary = useDictionary();

  const quantityRef = useRef(cartLen);
  const [cartChanged, setCartChanged] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Set the bottom nav cart ref for fly-to-cart animation
  useEffect(() => {
    if (containerRef.current) {
      bottomNavCartRef.current = containerRef.current;
    }
  }, [bottomNavCartRef]);

  return (
    <div ref={containerRef} className="flex flex-col items-center">
      <Badge
        className={`border-0 absolute top-2 right-2 ${cartChanged ? "hidden" : ""}`}
        color="danger"
        content={totalQuantity}
        data-badge
        size="sm"
        variant="shadow"
      >
        <Button
          isIconOnly
          aria-label="Go to cart"
          as={Link}
          className={`relative rounded-full bg-transparent ${cartChanged ? "animate-ping" : ""}`}
          href="/cart"
          variant="solid"
        >
          <ShoppingCartIcon size={30} />
        </Button>
      </Badge>
      {showLabel && (
        <span className="font-primary text-xs text-text-subtle dark:text-text-subtledark truncate w-full text-center">
          {dictionary?.cart?.title || "Cart"}
        </span>
      )}
    </div>
  );
}
