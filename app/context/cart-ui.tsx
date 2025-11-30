"use client";
import { createContext, useContext, useRef, ReactNode, RefObject } from "react";

type CartUIContextValue = {
  cartIconRef: RefObject<HTMLElement | null>;
  footerCartRef: RefObject<HTMLElement | null>;
  bottomNavCartRef: RefObject<HTMLElement | null>;
  bumpCartBadge: () => void;
};

const CartUIContext = createContext<CartUIContextValue | null>(null);

export function CartUIProvider({ children }: { children: ReactNode }) {
  const cartIconRef = useRef<HTMLElement | null>(null);
  const footerCartRef = useRef<HTMLElement | null>(null);
  const bottomNavCartRef = useRef<HTMLElement | null>(null);

  const bumpCartBadge = () => {
    // Priority: 1. Footer product info cart (if visible), 2. Bottom nav cart (mobile), 3. Navbar cart (desktop)

    // Check if footer cart is visible first
    const footerEl = footerCartRef.current;

    if (footerEl) {
      const rect = footerEl.getBoundingClientRect();
      const isVisible =
        rect.top >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth &&
        rect.width > 0 &&
        rect.height > 0;

      if (isVisible) {
        const badge = footerEl.querySelector<HTMLElement>("[data-badge]");

        if (badge) {
          badge.classList.remove("animate-bump");
          void badge.offsetWidth;
          badge.classList.add("animate-bump");

          return;
        }
      }
    }

    // Check if we're on mobile and bottom nav cart exists
    const isMobile = window.innerWidth < 768; // md breakpoint

    if (isMobile && bottomNavCartRef.current) {
      const badge = bottomNavCartRef.current.querySelector<HTMLElement>("[data-badge]");

      if (badge) {
        badge.classList.remove("animate-bump");
        void badge.offsetWidth;
        badge.classList.add("animate-bump");

        return;
      }
    }

    // Fallback to navbar cart (desktop)
    const el = cartIconRef.current?.querySelector<HTMLElement>("[data-badge]");

    if (!el) return;

    el.classList.remove("animate-bump");
    void el.offsetWidth;
    el.classList.add("animate-bump");
  };

  return (
    <CartUIContext.Provider value={{ cartIconRef, footerCartRef, bottomNavCartRef, bumpCartBadge }}>
      {children}
    </CartUIContext.Provider>
  );
}

export function useCartUI() {
  const ctx = useContext(CartUIContext);

  if (!ctx) throw new Error("useCartUI must be used within CartUIProvider");

  return ctx;
}
