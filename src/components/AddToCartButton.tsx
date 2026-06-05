"use client";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function AddToCartButton({ productId }: { productId: string }) {
  const { addToCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAdd = async () => {
    if (status !== "authenticated") {
      toast.error("Veuillez vous connecter");
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await addToCart(productId, 1);
      toast.success("Ajouté au panier !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleAdd} disabled={loading} className="btn-primary w-full py-2">
      {loading ? "..." : "Ajouter au panier"}
    </button>
  );
}