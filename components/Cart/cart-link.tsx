import React, { useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
import Link from "next/link";

import { ShoppingCartIcon } from "../icons";

import { useCart } from "@/app/context/cartContext";

export default function Cartlink() {
  const { cart } = useCart();
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (
      cart?.length &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length]);

  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Badge
      className="border-0 absolute top-2 right-2"
      color="danger"
      content={totalQuantity}
      size="sm"
      variant="shadow"
    >
      <Button
        isIconOnly
        as={Link}
        className="relative rounded-full bg-transparent"
        href="/cart"
        variant="solid"
      >
        <ShoppingCartIcon size={30} />
      </Button>
    </Badge>
  );
}
