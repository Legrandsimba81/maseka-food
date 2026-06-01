"use client"

import { Product } from "@prisma/client"
import Link from "next/link"
import Image from "next/image"
import { useCart } from "@/hooks/useCart"

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48">
        <Image
          src={product.imageUrl || "../images/produits/placeholder-bread.jpg"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center mt-4">
          <span className="text-amber-700 font-bold text-xl">{product.price.toFixed(2)} €</span>
          <div className="space-x-2">
            <Link href={`/products/${product.id}`} className="text-amber-600 hover:text-amber-700">
              Détails
            </Link>
            <button
              onClick={() => addToCart(product.id, 1)}
              className="btn-primary text-sm py-1 px-3"
            >
              Ajouter
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}