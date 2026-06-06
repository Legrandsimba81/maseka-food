"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import { ShoppingCart, Star } from "lucide-react";
import AddToCartButton from "@/components/AddToCartButton";
import { Phone, MapPin, Clock, User } from "lucide-react";


export default function PromotionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/promotions")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-8">Chargement...</div>;

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
      <div className="container mx-auto px-4 pt-8">
        {/* Bannière */}
        <div className="bg-gradient-to-r from-red-500 to-amber-500 rounded-2xl p-8 mb-10 text-white text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Offres spéciales</h1>
          <p className="text-lg">Profitez de nos promotions exceptionnelles avant qu'elles ne disparaissent !</p>
          {/* <p>1047466074437-vj5sf86tmgiqhqk7idejeprlmj1dhaps.apps.googleusercontent.com</p> */}
        </div>

        <section >
          <div className="container mx-auto px-4 flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
            {/* Texte */}
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl  text-gray-800 dark:text-white mb-2">
                <span>Bienvenue chez</span> <br /><span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-orange-600 dark:text-orange-500 mb-4">
                  maseka food promo
                </span>
              </h1>

              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 mb-6">
                Vous rêviez de nos burgers généreux, de nos pizzas croustillantes, de nos gâteaux d’anniversaire,
                du chawarma épicé ou de nos saucisses ? Ne cherchez plus : profitez de nos offres exceptionnelles
                sur toute la carte !
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link href="/products" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md">
                  Voir nos produits
                </Link>
                <Link href="/products?category=pâtisseries" className="bg-transparent border-2 border-orange-600 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/30 font-semibold px-6 py-3 rounded-xl transition">
                  Gâteaux pour cérémonies
                </Link>
              </div>
            </div>

            {/* Image */}
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

      <div className="bg-gray-900 text-white py-2 text-sm mb-8">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center gap-4">
            <span className="flex items-center gap-1.5">
              <Phone size={14} /> +243 827 733 286
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={14} /> Butembo, Nord-Kivu
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> 6h – 20h (Lundi – Dimanche)
            </span>
          </div>
          <Link href="/profile" className="flex items-center gap-1.5 hover:text-orange-400 transition">
            <User size={14} /> Mon Compte
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Grille des produits en promo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
              {/* Badge promo */}
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <Star size={12} fill="white" /> PROMO
              </div>
              {/* Image */}
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
      </div>
    </div>
  );
}