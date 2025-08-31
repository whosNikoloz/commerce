"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";

import { useCartStore } from "@/app/context/cartContext";

export default function CartDrawer() {
  // 🔹 selectors (fine-grained)
  const cart = useCartStore((s) => s.cart);
  const cartLines = useCartStore((s) => s.cart.length);
  const totalQuantity = useCartStore((s) => s.getCount());
  const subtotal = useCartStore((s) => s.getSubtotal());

  const updateCartItem = useCartStore((s) => s.updateCartItem);
  const removeFromCart = useCartStore((s) => s.removeFromCart);

  const [isOpen, setIsOpen] = useState(false);
  const quantityRef = useRef(cartLines);
  const closeCart = () => setIsOpen(false);

  useEffect(() => {
    if (cartLines > 0 && cartLines !== quantityRef.current) {
      quantityRef.current = cartLines;
    }
  }, [cartLines, isOpen]);

  return (
    <>
      <Badge color="danger" content={totalQuantity}>
        <Button
          isIconOnly
          className="relative rounded-full bg-transparent"
          variant="solid"
          onPress={() => setIsOpen((v) => !v)}
        >
          <ShoppingCartIcon className="h-6 w-6" />
        </Button>
      </Badge>

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
            <Dialog.Panel className="fixed right-0 top-0 h-full w-96 max-w-full bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-2xl rounded-l-xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">🛒 My Cart</h2>
                <button className="hover:rotate-90 transition-transform" onClick={closeCart}>
                  <XMarkIcon className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              {cartLines === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
                  <ShoppingCartIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
                  <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <ul className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
                    {cart.map((item) => (
                      <li
                        key={`${item.id}-${item.variantKey ?? ""}`}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition p-4"
                      >
                        <div className="flex items-center gap-3">
                          <Image
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                            height={64}
                            src={item.image}
                            width={64}
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              ₾{item.price.toFixed(2)}
                            </p>
                            {/* selected facets badges */}
                            {item.selectedFacets && Object.keys(item.selectedFacets).length > 0 && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(item.selectedFacets).map(([k, v]) => (
                                  <span
                                    key={k}
                                    className="text-[11px] rounded-full border px-2 py-0.5
                                           bg-gray-50 text-gray-700 border-gray-200
                                           dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700"
                                  >
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                            onClick={() =>
                              updateCartItem(
                                item.id,
                                Math.max(1, item.quantity - 1),
                                item.variantKey,
                              )
                            }
                          >
                            ➖
                          </button>
                          <span className="w-6 text-center font-medium text-gray-800 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition-colors"
                            onClick={() =>
                              updateCartItem(item.id, item.quantity + 1, item.variantKey)
                            }
                          >
                            ➕
                          </button>
                          <button
                            aria-label="Remove item"
                            className="ml-3 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Remove item"
                            onClick={() => removeFromCart(item.id, item.variantKey)}
                          >
                            ✖️
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="sticky bottom-0 p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                    <div className="flex justify-between text-xl font-bold mb-4">
                      <span className="text-gray-700 dark:text-gray-300">Total:</span>
                      <span className="text-green-600 dark:text-green-400">
                        ₾{subtotal.toFixed(2)}
                      </span>
                    </div>
                    <button className="w-full py-3 text-center bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors mb-safe-area">
                      🛒 Proceed to Checkout
                    </button>
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
