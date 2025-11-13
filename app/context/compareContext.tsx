"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ProductResponseModel } from "@/types/product";

export interface CompareState {
  items: ProductResponseModel[];
  addToCompare: (product: ProductResponseModel) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCompare: (product) =>
        set((state) => {
          // Limit to 4 products for comparison
          if (state.items.length >= 4) {
            return state;
          }

          // Don't add duplicates
          if (state.items.some((item) => item.id === product.id)) {
            return state;
          }

          return { items: [...state.items, product] };
        }),

      removeFromCompare: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),

      clearCompare: () => set({ items: [] }),

      isInCompare: (productId) => {
        return get().items.some((item) => item.id === productId);
      },
    }),
    {
      name: "compare-storage",
    }
  )
);
