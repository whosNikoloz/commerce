"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ShoppingCartIcon, MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@heroui/button";

import HeaderCartButton from "./header-cart-button";


import { useCartStore } from "@/app/context/cartContext";

export default function CartDrawer() {
  const cart = useCartStore((s) => s.cart);
  const cartLines = useCartStore((s) => s.cart.length);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _totalQuantity = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cartLines);
  const closeCart = () => setIsOpen(false);
  const handleClickCart = () => (isOpen ? setIsOpen(false) : setIsOpen(true));

  useEffect(() => {
    if (cartLines > 0 && cartLines !== quantityRef.current) {
      quantityRef.current = cartLines;
    }
  }, [cartLines, isOpen]);

  return (
    <>
      <HeaderCartButton className="bg-transparent" onClick={handleClickCart} />
      

      <Transition show={isOpen}>
        <Dialog className="relative z-50" onClose={closeCart}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-in-out duration-300"
            enterFrom="opacity-0 backdrop-blur-none"
            enterTo="opacity-100 backdrop-blur-sm"
            leave="transition-opacity ease-in-out duration-200"
            leaveFrom="opacity-100 backdrop-blur-sm"
            leaveTo="opacity-0 backdrop-blur-none"
          >
            <div aria-hidden="true" className="fixed inset-0 bg-black/40 dark:bg-black/60" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="transition-transform ease-in-out duration-300"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="transition-transform ease-in-out duration-200"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <Dialog.Panel className="fixed right-0 top-0 h-full w-[85%] sm:w-80 max-w-sm bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-l-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-3 py-3 sm:px-4 sm:py-3.5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
                  <h2 className="text-sm sm:text-base font-bold text-gray-800 dark:text-white">My Cart</h2>
                </div>
                <button
                  aria-label="Close cart"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all hover:rotate-90"
                  onClick={closeCart}
                >
                  <XMarkIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {cartLines === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-4 text-center">
                  <ShoppingCartIcon className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400 dark:text-gray-500" />
                  <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-300">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ul className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 pb-26">
                    {cart.map((item) => (
                      <li
                        key={`${item.id}}`}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-2 gap-2"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Image
                            alt={item.name}
                            className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded border border-gray-200 dark:border-gray-700 flex-shrink-0"
                            height={56}
                            src={item.image}
                            width={56}
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-white truncate leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                              ₾{item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            aria-label="Decrease quantity"
                            className="p-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() =>
                              updateCartItem(
                                item.id,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                          >
                            <MinusIcon className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                          </button>
                          <span className="w-5 text-center font-medium text-xs text-gray-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            aria-label="Increase quantity"
                            className="p-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={() =>
                              updateCartItem(item.id, item.quantity + 1)
                            }
                          >
                            <PlusIcon className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                          </button>
                          <button
                            aria-label="Remove item"
                            className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors ml-0.5"
                            title="Remove item"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <TrashIcon className="h-3.5 w-3.5 text-red-500 dark:text-red-400" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  

                  <div className="sticky bottom-0 px-3 py-3 sm:px-4 sm:py-3.5 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    <div className="flex justify-between items-center text-sm sm:text-base font-bold mb-2.5">
                      <span className="text-gray-700 dark:text-gray-300">Total:</span>
                      <span className="text-brand-primary dark:text-brand-primaryDark">
                        ₾{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      as={Link}
                      className="flex-1 w-full bottom-0 h-10 rounded-lg font-semibold bg-brand-primary hover:bg-brand-primary/90 text-white shadow-md hover:shadow-lg"
                      href="/cart"
                      onPress={closeCart}
                    >
                      <span className="text-sm">ნახვა</span>
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Panel>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
}
