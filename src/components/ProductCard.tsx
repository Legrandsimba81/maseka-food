"use client";

import { Product } from "@prisma/client";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    // Vérifier si l'utilisateur est connecté
    if (status !== "authenticated") {
      toast.error("Veuillez vous connecter pour ajouter au panier");
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      await addToCart(product.id, 1);
      toast.success("Ajouté au panier !");
    } catch (error) {
      toast.error("Erreur lors de l'ajout");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden p-4">
      <div className="relative dark:bg-gray-300 bg-amber-50 h-48 rounded-md overflow-hidden">
        <Image
          src={product.imageUrl || "/images/produits/placeholder-bread.jpg"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
        <p className="text-gray-400 text-sm mb-1 line-clamp-2">{product.description}</p>
        <div className="flex flex-wrap justify-between items-center mt-4">
          <span className="text-orange-500 dark:text-white font-bold text-xl">{formatPrice(product.price)} $</span>
          <div className=" space-x-2">
            <Link href={`/products/${product.id}`} className="text-amber-600 hover:text-amber-700">
              Voir les détails
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={loading}
              className="btn-primary text-sm py-1 px-5"
            >
              {loading ? "..." : "Acheter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}