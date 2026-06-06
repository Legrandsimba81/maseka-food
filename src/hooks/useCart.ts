"use client";
import { create } from "zustand";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
}

interface CartStore {
  items: CartItem[];
  loading: boolean;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getItemCount: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  loading: false,
  fetchCart: async () => {
    set({ loading: true });
    const res = await fetch("/api/cart");
    if (res.ok) {
      const cart = await res.json();
      const items = cart.items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity,
        name: item.product.name,
        price: item.product.price,
      }));
      set({ items, loading: false });
    } else {
      set({ loading: false });
    }
  },
  addToCart: async (productId, quantity) => {
    const res = await fetch(`/api/products/${productId}`);
    const product = await res.json();
    const price = product.effectivePrice || product.price;
    const currentItems = get().items;
    const existing = currentItems.find(i => i.productId === productId);
    let newItems;
    if (existing) {
      newItems = currentItems.map(i =>
        i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      newItems = [...currentItems, { productId, quantity, name: product.name, price }];
    }
    set({ items: newItems });
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    });
  },
  removeFromCart: async (productId) => {
    const newItems = get().items.filter(i => i.productId !== productId);
    set({ items: newItems });
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    });
  },
  updateQuantity: async (productId, quantity) => {
    if (quantity <= 0) {
      await get().removeFromCart(productId);
      return;
    }
    const newItems = get().items.map(i =>
      i.productId === productId ? { ...i, quantity } : i
    );
    set({ items: newItems });
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: newItems.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
    });
  },
  clearCart: async () => {
    set({ items: [] });
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [] }),
    });
  },
  getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  getTotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

export const useCart = () => {
  const { data: session } = useSession();
  const { fetchCart, ...store } = useCartStore();

  useEffect(() => {
    if (session) {
      fetchCart();
    } else {
      useCartStore.setState({ items: [] });
    }
  }, [session]);

  return store;
};