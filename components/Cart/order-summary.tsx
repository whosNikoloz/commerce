"use client";
import React, { useEffect, useRef } from "react";
import Link from "next/link";

import { useCart } from "@/app/context/cartContext";

export default function OrderSummary() {
  const { cart } = useCart();
  const quantityRef = useRef(cart?.length || 0);

  useEffect(() => {
    if (
      cart?.length !== undefined &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length]);
  const originalPrice =
    cart?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 7592;
  const savings = 299;
  const storePickup = 99;
  const tax = 799;
  const total = originalPrice - savings + storePickup + tax;

  return (
    <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
      <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-6">
        <p className="text-xl font-semibold text-gray-900 dark:text-white">
          Order summary
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Original price
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${originalPrice.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Savings
              </dt>
              <dd className="text-base font-medium text-green-600">
                -${savings.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Store Pickup
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${storePickup.toFixed(2)}
              </dd>
            </dl>

            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                Tax
              </dt>
              <dd className="text-base font-medium text-gray-900 dark:text-white">
                ${tax.toFixed(2)}
              </dd>
            </dl>
          </div>

          <dl className="flex items-center justify-between gap-4 border-t border-gray-200 pt-2 dark:border-gray-700">
            <dt className="text-base font-bold text-gray-900 dark:text-white">
              Total
            </dt>
            <dd className="text-base font-bold text-gray-900 dark:text-white">
              ${total.toFixed(2)}
            </dd>
          </dl>
        </div>

        <Link
          className="flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          href="#"
        >
          Proceed to Checkout
        </Link>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            or
          </span>
          <Link
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 underline hover:no-underline dark:text-primary-500"
            href="#"
            title="Continue Shopping"
          >
            Continue Shopping
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5m14 0-4 4m4-4-4-4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
