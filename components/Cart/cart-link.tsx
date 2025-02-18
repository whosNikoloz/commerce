import React, { useEffect, useRef } from "react";
import { useCart } from "@/app/context/cartContext";
import { Button } from "@heroui/button";
import {  ShoppingCartIcon } from "../icons";
import { Badge } from "@heroui/badge";
import Link from "next/link";

export default function Cartlink() {
  const { cart } = useCart();
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (cart?.length && cart.length !== quantityRef.current && cart.length > 0) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length]);


  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <Badge 
        color="danger"
        size="sm"
        variant="shadow"
        content={totalQuantity}
        className="border-0 absolute top-2 right-2"
            >
        <Button
        variant="solid"
        isIconOnly
        className="relative rounded-full bg-transparent"
        as={Link}
        href="/cart"
            >
        <ShoppingCartIcon  size={30}/>
        </Button>
    </Badge>
  );
}