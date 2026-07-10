"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { ShoppingCart, Star, Phone, MapPin, Clock, User } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import ShareButton from "@/components/ShareButtonProduit";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  promoPrice: number;
  imageUrl: string | null;
  category: string;
}

export default function PromotionsClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products] = useState(initialProducts);

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Aucune promotion</h1>
        <p className="text-gray-600">Revenez bientôt pour découvrir nos offres exceptionnelles.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Section hero – inchangée */}
      <div className="container mx-auto px-4 pt-8">
        <section>
          <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl text-gray-800 dark:text-white mb-2">
                <span>Bienvenue chez</span> <br />
                <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-500">
                  maseka food promo
                </span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-6">
                Vous rêviez de nos burgers généreux, de nos pizzas croustillantes, de nos gâteaux d’anniversaire,
                du chawarma épicé ou de nos saucisses ? Ne cherchez plus : profitez de nos offres exceptionnelles
                sur toute la carte !
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/products" className="hidden md:block bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md">
                  Voir nos produits
                </Link>
                <Link href="/products?category=pâtisseries" className="bg-orange-50 dark:bg-orange-900/30 border-2 border-orange-600 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 font-semibold px-6 py-3 rounded-xl transition">
                  Gâteaux pour cérémonies
                </Link>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-w-md md:max-w-lg rounded-2xl overflow-hidden">
                <Image
                  src="/images/produits/aliakas.png"
                  alt="Boulangerie Maseka Food"
                  width={500}
                  height={400}
                  className="object-cover w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Barre d'info */}
      <div className="bg-gray-900 text-white py-2 text-sm mb-8 dark:bg-gray-400 dark:text-gray-900">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> +243 827 733 286
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> Butembo, Nord-Kivu
            </span>
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <Clock size={14} /> 8h – 20h (Lundi – Dimanche)
            </span>
          </div>
          <Link href="/profile" className="hidden md:flex items-center gap-1.5 hover:text-orange-400 transition">
            <User size={14} /> Mon Compte
          </Link>
        </div>
      </div>

      {/* Bannière promo avec bouton partage */}
      <div className="container mx-auto px-4 pt-8">
        <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-6 md:p-8 mb-10 text-white text-center relative">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Offres spéciales</h1>
          <p className="text-lg mb-4">Profitez de nos promotions exceptionnelles avant qu'elles ne disparaissent !</p>
          <div className="flex flex-wrap justify-center gap-4">
            <ShareButton
              title="Offres spéciales Maseka Food"
              description="Profitez de nos promotions exceptionnelles avant qu'elles ne disparaissent !"
              url="https://maseka-food.vercel.app/promotions"
            />
            <Link
              href="/products"
              className="bg-white text-orange-600 hover:bg-orange-100 font-semibold px-6 py-2 rounded-xl transition shadow-md inline-flex items-center gap-2"
            >
              <ShoppingCart size={18} /> Voir les offres
            </Link>
          </div>
        </div>
      </div>

      {/* Grille des produits */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star size={12} fill="white" /> PROMO
              </div>
              <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={product.imageUrl || "/images/produits/placeholder.jpg"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-gray-400 line-through text-sm">{formatPrice(product.price)} $</span>
                  <span className="text-red-600 font-bold text-xl">{formatPrice(product.promoPrice)} $</span>
                </div>
                <div className="flex gap-2">
                  <AddToCartButton productId={product.id} />
                  <Link
                    href={`/products/${product.id}`}
                    className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    aria-label="Voir détails"
                  >
                    <ShoppingCart size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Section CTA */}
        <div className="mt-16 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Ne manquez pas ces offres exceptionnelles !
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Commandez dès maintenant et faites-vous livrer vos produits préférés à Butembo ou venez les déguster sur place.
            Nos équipes vous accueillent du lundi au dimanche de 6h à 20h.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/products"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-3 rounded-xl transition shadow-md flex items-center gap-2"
            >
              <ShoppingCart size={20} /> Commander maintenant
            </Link>
            <Link
              href="/contact"
              className="bg-transparent border-2 border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}