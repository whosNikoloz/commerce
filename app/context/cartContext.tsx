"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

export type CartItem = {
  discount: any;
  originalPrice: ReactNode;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;

  selectedFacets?: Record<string, string>;
  variantKey?: string;
};

type Facets = Record<string, string | undefined | null> | undefined | null;

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, variantKey?: string) => void;
  updateCartItem: (id: string, quantity: number, variantKey?: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const SECRET_KEY = process.env.NEXT_PUBLIC_CART_SECRET_KEY || "defaultSecretKey";
const CART_KEY = "cart:v1";

const encryptData = (data: unknown): string =>
  CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();

const decryptData = <T,>(encrypted: string): T | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);

    return JSON.parse(decrypted) as T;
  } catch (error) {
    console.error("Failed to decrypt cart data:", error);

    return null;
  }
};

export const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) throw new Error("useCart must be used within a CartProvider");

  return ctx;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(CART_KEY);

    if (!saved) return;
    const parsed = decryptData<CartItem[]>(saved);

    if (Array.isArray(parsed)) setCart(parsed);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (cart.length === 0) {
      // ensure old data isn’t left behind
      localStorage.removeItem(CART_KEY);

      return;
    }
    localStorage.setItem(CART_KEY, encryptData(cart));
  }, [cart]);

  const normalizeFacets = (facets: Facets) => {
    if (!facets) return null;
    const entries = Object.entries(facets).filter(([, v]) => v != null && String(v).trim() !== "");

    if (entries.length === 0) return null;
    entries.sort(([a], [b]) => a.localeCompare(b));

    return Object.fromEntries(entries) as Record<string, string>;
  };

  const buildVariantKey = (facets: Facets): string => {
    const norm = normalizeFacets(facets);

    if (!norm) return "__BASE__";

    return Object.entries(norm)
      .map(([k, v]) => `${k}:${v}`)
      .join("|");
  };

  const addToCart = (item: CartItem) => {
    const id = String(item.id);
    const variantKey = buildVariantKey(item.selectedFacets);

    setCart((prev) => {
      const existing = prev.find(
        (i) => String(i.id) === id && (i.variantKey ?? "__BASE__") === variantKey,
      );

      if (existing) {
        return prev.map((i) =>
          String(i.id) === id && (i.variantKey ?? "__BASE__") === variantKey
            ? { ...i, quantity: i.quantity + Math.max(1, item.quantity || 1) }
            : i,
        );
      }

      return [
        ...prev,
        {
          ...item,
          id,
          quantity: Math.max(1, item.quantity || 1),
          variantKey,
          // Optional: persist normalized facets so UI/toasts are consistent
          selectedFacets: normalizeFacets(item.selectedFacets) ?? undefined,
        },
      ];
    });

    const norm = normalizeFacets(item.selectedFacets);
    const pretty = norm
      ? " (" +
        Object.entries(norm)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ") +
        ")"
      : "";

    toast.success(`${item.name}${pretty} დაემატა კალათაში`);
  };

  const removeFromCart = (id: string, variantKey?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.id === String(id) && (item.variantKey ?? "") === (variantKey ?? "")),
      ),
    );
    toast.success("საქონელი წაიშალა კალათიდან");
  };

  const updateCartItem = (id: string, quantity: number, variantKey?: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === String(id) && (item.variantKey ?? "") === (variantKey ?? "")
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateCartItem, clearCart }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
