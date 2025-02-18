import React, { useState, useEffect, useRef } from "react";
import { useCart } from "@/app/context/cartContext";


export default function Cart() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (cart?.length && cart.length !== quantityRef.current && cart.length > 0) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length, isOpen]);


  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2);
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>

    </>
  );
}