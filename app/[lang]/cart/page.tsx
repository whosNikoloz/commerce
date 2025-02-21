import Image from "next/image";
import Link from "next/link";
import React from "react";

import OrderSummary from "@/components/Cart/order-summary";
import CartItems from "@/components/Cart/cart-items";

// CartPage Component

const CartPage = () => {
  return (
    <section className="bg-white py-8 antialiased dark:bg-transparent md:py-16">
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white sm:text-2xl">
          Shopping Cart
        </h2>

        <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
          <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
            <div className="space-y-6">
              <CartItems />
            </div>
            <div className="hidden xl:mt-8 xl:block">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                People also bought
              </h3>
              <div className="mt-6 grid grid-cols-3 gap-4 sm:mt-8">
                <div className="space-y-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <Link className="overflow-hidden rounded" href="#">
                    <Image
                      alt="imac image"
                      className="mx-auto h-44 w-44 dark:hidden"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                    <Image
                      alt="imac image"
                      className="mx-auto hidden h-44 w-44 dark:block"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                  </Link>
                  <div>
                    <Link
                      className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white"
                      href="#"
                    >
                      iMac 27”
                    </Link>
                    <p className="mt-2 text-base font-normal text-gray-500 dark:text-gray-400">
                      This generation has some improvements, including a longer
                      continuous battery life.
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      <span className="line-through"> $399,99 </span>
                    </p>
                    <p className="text-lg font-bold leading-tight text-red-600 dark:text-red-500">
                      $299
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2.5">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                      data-tooltip-target="favourites-tooltip-1"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <div
                      className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                      id="favourites-tooltip-1"
                      role="tooltip"
                    >
                      Add to favourites
                      <div data-popper-arrow className="tooltip-arrow" />
                    </div>
                    <button
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium  text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="-ms-2 me-2 h-5 w-5"
                        fill="none"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7h-1M8 7h-.688M13 5v4m-2-2h4"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                </div>
                <div className="space-y-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <Link className="overflow-hidden rounded" href="#">
                    <Image
                      alt="imac image"
                      className="mx-auto h-44 w-44 dark:hidden"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                    <Image
                      alt="imac image"
                      className="mx-auto hidden h-44 w-44 dark:block"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                  </Link>
                  <div>
                    <Link
                      className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white"
                      href="#"
                    >
                      Playstation 5
                    </Link>
                    <p className="mt-2 text-base font-normal text-gray-500 dark:text-gray-400">
                      This generation has some improvements, including a longer
                      continuous battery life.
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      <span className="line-through"> $799,99 </span>
                    </p>
                    <p className="text-lg font-bold leading-tight text-red-600 dark:text-red-500">
                      $499
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2.5">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                      data-tooltip-target="favourites-tooltip-2"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <div
                      className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                      id="favourites-tooltip-2"
                      role="tooltip"
                    >
                      Add to favourites
                      <div data-popper-arrow className="tooltip-arrow" />
                    </div>
                    <button
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium  text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="-ms-2 me-2 h-5 w-5"
                        fill="none"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7h-1M8 7h-.688M13 5v4m-2-2h4"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                </div>
                <div className="space-y-6 overflow-hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <Link className="overflow-hidden rounded" href="#">
                    <Image
                      alt="imac image"
                      className="mx-auto h-44 w-44 dark:hidden"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                    <Image
                      alt="imac image"
                      className="mx-auto hidden h-44 w-44 dark:block"
                      height={80}
                      src="https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front-dark.svg"
                      width={80}
                    />
                  </Link>
                  <div>
                    <Link
                      className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white"
                      href="#"
                    >
                      Apple Watch Series 8
                    </Link>
                    <p className="mt-2 text-base font-normal text-gray-500 dark:text-gray-400">
                      This generation has some improvements, including a longer
                      continuous battery life.
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      <span className="line-through"> $1799,99 </span>
                    </p>
                    <p className="text-lg font-bold leading-tight text-red-600 dark:text-red-500">
                      $1199
                    </p>
                  </div>
                  <div className="mt-6 flex items-center gap-2.5">
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                      data-tooltip-target="favourites-tooltip-3"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 6C6.5 1 1 8 5.8 13l6.2 7 6.2-7C23 8 17.5 1 12 6Z"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                    </button>
                    <div
                      className="tooltip invisible absolute z-10 inline-block rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white opacity-0 shadow-sm transition-opacity duration-300 dark:bg-gray-700"
                      id="favourites-tooltip-3"
                      role="tooltip"
                    >
                      Add to favourites
                      <div data-popper-arrow className="tooltip-arrow" />
                    </div>

                    <button
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary-700 px-5 py-2.5 text-sm font-medium  text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="button"
                    >
                      <svg
                        aria-hidden="true"
                        className="-ms-2 me-2 h-5 w-5"
                        fill="none"
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7h-1M8 7h-.688M13 5v4m-2-2h4"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        />
                      </svg>
                      Add to cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <OrderSummary />
        </div>
      </div>
    </section>
  );
};

export default CartPage;
