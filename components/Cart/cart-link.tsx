import React, { useEffect, useRef, useState } from "react"; // Import useState here
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import Link from "next/link";

import { ShoppingCartIcon } from "../icons";

import { useCart } from "@/app/context/cartContext";

export default function Cartlink() {
  const { cart } = useCart();
  const quantityRef = useRef(cart?.length);
  const [cartChanged, setCartChanged] = useState(false); // State for tracking cart change

  useEffect(() => {
    if (
      cart?.length &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
      setCartChanged(true); // Trigger animation when cart changes
    }
  }, [cart?.length]);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    if (cartChanged) {
      const timer = setTimeout(() => setCartChanged(false), 500); // Reset animation after 500ms
      return () => clearTimeout(timer);
    }
  }, [cartChanged]);

  return (
    <Badge
      className={`border-0 absolute top-2 right-2 ${
        cartChanged ? "hidden" : ""
      }`} 
      color="danger"
      content={totalQuantity}
      size="sm"
      variant="shadow"
    >
      <Button
        isIconOnly
        as={Link}
        className={`relative rounded-full bg-transparent ${
          cartChanged ? "animate-ping" : ""
        }`} 
        href="/cart"
        variant="solid"
      >
        <ShoppingCartIcon size={30} />
      </Button>
    </Badge>
  );
}
