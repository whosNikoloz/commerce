"use client";
import { createContext, useContext, useRef, ReactNode, RefObject } from "react";

type CartUIContextValue = {
  cartIconRef: RefObject<HTMLElement | null>;
  bumpCartBadge: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const cartIconRef = useRef<HTMLElement | null>(null);

  const bumpCartBadge = () => {
    const el = cartIconRef.current?.querySelector<HTMLElement>("[data-badge]");

    if (!el) return;

    el.classList.remove("animate-bump");
    void el.offsetWidth; 
    el.classList.add("animate-bump");
  };

  return (
    <CartUIContext.Provider value={{ cartIconRef, bumpCartBadge }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);

  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");

  return ctx;
}
