"use client";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import toast from "react-hot-toast";

export default function AddToCartButton({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    await addToCart(productId, 1);
    toast.success("Ajouté au panier !");
    setLoading(false);
  };

  return (
    <button onClick={handleAdd} disabled={loading} className="btn-primary w-full">
      {loading ? "..." : "Ajouter au panier"}
    </button>
  );
}