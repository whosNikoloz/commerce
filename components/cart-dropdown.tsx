"use client";

import { useState, useEffect, useRef } from "react";

import { ShoppingCartIcon } from "./icons";

import { useCart } from "@/app/context/cartContext";

export default function CartDropdown() {
  const { cart, removeFromCart, updateCartItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const quantityRef = useRef(cart?.length);

  useEffect(() => {
    if (
      cart?.length &&
      cart.length !== quantityRef.current &&
      cart.length > 0
    ) {
      quantityRef.current = cart.length;
    }
  }, [cart?.length, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: { target: any }) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const totalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <ShoppingCartIcon className="h-6 w-6" />
        {totalQuantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-300 animate-in fade-in">
            {totalQuantity}
          </span>
        )}
      </button>

      <div
        className={`absolute right-0 top-12 w-96 bg-white shadow-xl rounded-lg overflow-hidden transition-all duration-300 transform origin-top ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-bold text-lg">Shopping Cart</h3>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Your cart is empty
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-4 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <img
                        alt={item.name}
                        className="h-16 w-16 rounded-md object-cover"
                        src={item.image}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-gray-900">
                          {item.price} ₾
                        </span>
                        {item.discount && (
                          <>
                            <span className="text-sm line-through text-gray-400">
                              {item.originalPrice} ₾
                            </span>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                              -{item.discount}%
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity - 1)
                        }
                      >
                        <span className="w-6 h-6 flex items-center justify-center">
                          -
                        </span>
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        onClick={() =>
                          updateCartItem(item.id, item.quantity + 1)
                        }
                      >
                        <span className="w-6 h-6 flex items-center justify-center">
                          +
                        </span>
                      </button>
                      <button
                        className="p-1 rounded-full text-red-500 hover:bg-red-50 transition-colors duration-200"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <span className="w-6 h-6 flex items-center justify-center">
                          ×
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-4 bg-white border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">
                {totalPrice} ₾
              </span>
            </div>
            <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200">
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
