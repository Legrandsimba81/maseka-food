"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: async (productId, quantity) => {
        try {
          const res = await fetch(`/api/products/${productId}`);
          if (!res.ok) throw new Error("Produit non trouvé");
          const product = await res.json();
          set((state) => {
            const existing = state.items.find((i) => i.productId === productId);
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
                ),
              };
            }
            return {
              items: [...state.items, { productId, quantity, name: product.name, price: product.price }],
            };
          });
        } catch (error) {
          console.error("Erreur ajout panier:", error);
        }
      },
      removeFromCart: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
        } else {
          set({ items: get().items.map((i) => (i.productId === productId ? { ...i, quantity } : i)) });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);