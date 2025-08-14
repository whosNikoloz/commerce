"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

export type CartItem = {
  discount: any;
  originalPrice: ReactNode;
  id: string;            // ✅ string everywhere
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;              // ✅ string
  updateCartItem: (id: string, quantity: number) => void; // ✅ string
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const SECRET_KEY =
  process.env.NEXT_PUBLIC_CART_SECRET_KEY || "defaultSecretKey";
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

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const id = String(item.id);
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i =>
          i.id === id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, id, quantity: Math.max(1, item.quantity || 1) }];
    });
    toast.success(`${item.name} added to cart`);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id === String(id) ? false : true));
    toast.success("Item removed from cart");
  };

  const updateCartItem = (id: string, quantity: number) => {
    setCart(prev =>
      prev.map(item =>
        item.id === String(id)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const value = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateCartItem, clearCart }),
    [cart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
