"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import { useCart } from "@/app/context/cartContext";

export default function CartItems() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (
      cart?.length !== undefined &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length]);

  const handleQuantityChange = (
    item: {
      darkImage?: string;
      discount?: any;
      originalPrice?: React.ReactNode;
      id: any;
      name?: string;
      price?: number;
      image?: string;
      quantity: any;
    },
    amount: number
  ) => {
    const newQuantity = item.quantity + amount;

    if (newQuantity >= 1) {
      updateCartItem(item.id, newQuantity);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 md:p-6">
      {cart.map((item) => (
        <div
          key={item.id}
          className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0"
        >
          <Link className="shrink-0 md:order-1" href="#">
            <Image
              alt={item.name}
              className="h-20 w-20 dark:hidden"
              height={80}
              src={item.image}
              width={80}
            />
            <Image
              alt={item.name}
              className="hidden h-20 w-20 dark:block"
              height={80}
              src={item.image}
              width={80}
            />
          </Link>

          <div className="flex items-center justify-between md:order-3 md:justify-end">
            <div className="flex items-center">
              <button
                className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                type="button"
                onClick={() => handleQuantityChange(item, -1)}
              >
                <svg
                  aria-hidden="true"
                  className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 18 2"
                >
                  <path
                    d="M1 1h16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
              <input
                readOnly
                className="w-10 text-center text-sm font-medium text-gray-900 dark:text-white"
                value={item.quantity}
              />
              <button
                className="inline-flex h-5 w-5 items-center justify-center rounded-md border border-gray-300 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-700"
                type="button"
                onClick={() => handleQuantityChange(item, 1)}
              >
                <svg
                  aria-hidden="true"
                  className="h-2.5 w-2.5 text-gray-900 dark:text-white"
                  fill="none"
                  viewBox="0 0 18 18"
                >
                  <path
                    d="M9 1v16M1 9h16"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            <div className="text-end md:order-4 md:w-32">
              <p className="text-base font-bold text-gray-900 dark:text-white">
                ${item.price.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md">
            <Link
              className="text-base font-medium text-gray-900 hover:underline dark:text-white"
              href="#"
            >
              {item.name}
            </Link>

            <div className="flex items-center gap-4">
              <button
                className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline dark:text-gray-400 dark:hover:text-white"
                type="button"
              >
                <svg
                  aria-hidden="true"
                  className="me-1.5 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12.01 6.001C6.5 1 1 8 5.782 13.001L12.011 20l6.23-7C23 8 17.5 1 12.01 6.002Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Add to Favorites
              </button>

              <button
                className="inline-flex items-center text-sm font-medium text-red-600 hover:underline dark:text-red-500"
                type="button"
                onClick={() => removeFromCart(item.id)}
              >
                <svg
                  aria-hidden="true"
                  className="me-1.5 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M6 18 17.94 6M18 18 6.06 6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
