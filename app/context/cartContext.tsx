// src/store/useCartStore.ts
import type { ReactNode } from "react";

import { create, type StateCreator } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";
import CryptoJS from "crypto-js";
import { toast } from "sonner";

import { getProductRestsByIds } from "../api/services/productService";

import { getCachedMerchantType } from "@/app/api/services/integrationService";

import { trackAddToCart, trackRemoveFromCart, cartItemToGA4Item, calculateItemsValue } from "@/lib/analytics/ga4";


export type CartItem = {
  discount: any;
  originalPrice?: ReactNode;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

// type Facets = Record<string, string | undefined | null> | undefined | null;

type CartState = {
  cart: CartItem[];

  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;

  setQuantityDelta: (id: string, delta: number) => void;
  getItem: (id: string) => CartItem | undefined;
  getCount: () => number;
  getSubtotal: () => number;

  checkAndAddToCart: (item: CartItem) => Promise<void>;
  smartAddToCart: (item: CartItem) => Promise<void>;
};

/** ---------------- Secrets + Keys ---------------- */
const SECRET_KEY = process.env.NEXT_PUBLIC_CART_SECRET_KEY || "defaultSecretKey";
const CART_KEY = "cart:v1";

/** ---------------- Crypto helpers ---------------- */
const encryptText = (plain: string): string => CryptoJS.AES.encrypt(plain, SECRET_KEY).toString();

const decryptText = (cipher: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SECRET_KEY);
    const out = bytes.toString(CryptoJS.enc.Utf8);

    return out || null;
  } catch {
    return null;
  }
};

/** ---------------- Removed Facet helpers - variants are separate products now ---------------- */

/** ---------------- Core creator (typed) ---------------- */
const creator: StateCreator<CartState> = (set, get) => ({
  cart: [],

  addToCart: (item) => {
    const id = String(item.id);

    set((state) => {
      const existing = state.cart.find((i) => i.id === id);

      let newCart: CartItem[];

      if (existing) {
        newCart = state.cart.map((i) =>
          i.id === id
            ? { ...i, quantity: i.quantity + Math.max(1, item.quantity || 1) }
            : i,
        );
      } else {
        newCart = [
          ...state.cart,
          {
            ...item,
            id,
            quantity: Math.max(1, item.quantity || 1),
          },
        ];
      }

      toast.success(`${item.name} დაემატა კალათაში`);

      // Track add to cart event in GA4
      const gaItem = cartItemToGA4Item(item);
      const value = calculateItemsValue([gaItem]);

      trackAddToCart({
        items: [gaItem],
        value,
      });

      return { cart: newCart };
    });
  },

  removeFromCart: (id) =>
    set((state) => {
      // Find the item being removed for tracking
      const removedItem = state.cart.find((item) => item.id === String(id));
      const newCart = state.cart.filter((item) => item.id !== String(id));

      toast.success("საქონელი წაიშალა კალათიდან");

      // Track remove from cart event in GA4
      if (removedItem) {
        const gaItem = cartItemToGA4Item(removedItem);
        const value = calculateItemsValue([gaItem]);

        trackRemoveFromCart({
          items: [gaItem],
          value,
        });
      }

      return { cart: newCart };
    }),

  updateCartItem: (id, quantity) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === String(id)
          ? { ...item, quantity: Math.max(1, quantity) }
          : item,
      ),
    })),

  clearCart: () => set({ cart: [] }),

  setQuantityDelta: (id, delta) =>
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === String(id)
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item,
      ),
    })),

  getItem: (id) =>
    get().cart.find((i) => i.id === String(id)),

  getCount: () => get().cart.reduce((sum, i) => sum + i.quantity, 0),

  getSubtotal: () => get().cart.reduce((sum, i) => sum + i.price * i.quantity, 0),

  checkAndAddToCart: async (item) => {
    try {
      const rests = await getProductRestsByIds({ prods: [item.id] });

      if (rests.ex) {
        toast.error("მარაგის შემოწმება ვერ მოხერხდა");

        return;
      }
      const r = rests.summedRests.find(x => x.id === item.id);

      if (!r || r.totalRest <= 0) {
        toast.error("მარაგში აღარ არის");

        return;
      }

      get().addToCart(item);
    } catch {
      toast.error("სერვერთან კავშირი ვერ მოხერხდა");
    }
  },
  smartAddToCart: async (item) => {
    const merchantType = getCachedMerchantType();

    if (merchantType === "FINA") {
      await get().checkAndAddToCart(item);
    } else {
      get().addToCart(item);
    }
  },
});

const encryptedStorage: StateStorage = {
  getItem: (name: string) => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(name);

    if (!raw) return null;

    const plain = decryptText(raw);

    return plain ?? raw;
  },
  setItem: (name: string, value: string) => {
    if (typeof window === "undefined") return;

    try {
      const parsed = JSON.parse(value) as { state: CartState; version: number };

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      parsed.state.cart = parsed.state.cart.map(({ originalPrice, ...rest }) => rest);

      const plain = JSON.stringify(parsed);
      const cipher = encryptText(plain);

      localStorage.setItem(name, cipher);
    } catch {
      localStorage.setItem(name, encryptText(value));
    }
  },
  removeItem: (name: string) => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
  },
};

/** ---------------- Persist with encryption ----------------
 * - createJSONStorage gives us the correct storage shape
 * - serialize/deserialize lets us encrypt the entire blob
 * - we strip non-serializable fields before stringify
 -----------------------------------------------------------*/
export const useCartStore = create<CartState>()(
  persist(creator, {
    name: CART_KEY,
    version: 1,
    storage: createJSONStorage(() => encryptedStorage),
    // If TS complains about partialize type, cast to Partial<CartState>
    partialize: (state) => ({ cart: state.cart }) as Partial<CartState>,
  }),
);
