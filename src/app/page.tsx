// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Contener } from "@/components/contener";
import FoodBar from "@/components/foodBar";
import Image from "next/image";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({ take: 6, where: { isAvailable: true } });
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="flex flex-col-2 bg-[url('/images/produits/fond-hero-copy-2.JPG')] dark:bg-[url('/images/produits/dark-mode-fond.JPG')] dark:custom-image bg-cover bg-center bg-no-repeat h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden lg:py-0  md:py-20 sm:py-20 py-10">
        <Contener className="flex items-center">
          <div className="w-[600px] h-auto hidden md:block">
            <img src="/images/produits/berger-plat.png" alt="Alia Kas et Isie pub maseka food promo" className="custom-image"/>
          </div>

          <div className=" text-center px-5 md:px-0 md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight dark:text-white">maseka food<br/>boulangerie</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Bienvenue chez maseka food ! votre boulangerie de référence à Butembo. Découvrez nos pains artisanaux, viennoiseries dorées et pâtisseries gourmandes, préparés avec passion pour ravir vos papilles.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="/products" className="bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-800 transition">Commander maintenant</Link>
              <Link href="/reservation" className="bg-orange-500/50 border border-orange-400 dark:text-white text-orange-950 px-6 py-3 rounded-xl font-medium dark:hover:bg-orange-900 hover:bg-orange-300 transition">Réserver une table</Link>
            </div>
          </div>
        </Contener>
      </section>
      <FoodBar/>
      <section className="pt-8 md:pt-16 container mx-auto px-8 md:px-4">
        <div className="md:px-10 lg:px-0">
          <div className="flex items-center justify-center bg-gradient-to-r from-[#d19268] to-[#ffe1c1] p-0 w-full gap-4 dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800 rounded-2xl overflow-hidden">
            <div className="w-[300px] md:w-[500px]  h-auto md:-my-10 object-cover">
              <img src="/images/produits/cake-birthday.png" alt="pizza" className="w-full h-full object-cover"/>
            </div>
            <div >
              <div className="mb-3 text-2xl font-bold md:text-6xl text-[#6d4429] dark:text-white">Cake of birthday</div>
              <Link href="/products" className="bg-[#6d4429] hover:bg-orange-900/50 text-white dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:border-2 dark:border-gray-600 dark:text-gray-200 rounded-xl px-3 text-[13px] md:text-base md:px-6 py-2">
                  Voir les détails
              </Link>
              <p className="mt-3 text-[14px] md:text-base dark:text-gray-300">
                Une délicieuse combinaison de saveurs et d'ingrédients frais !
              </p>
            </div>
          </div>
        </div>
        
      </section>
      {/* Produits vedettes */}
      <section className="py-8 md:py-16 container mx-auto px-8 md:px-4">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-[#6d4429] dark:text-white font-bold text-center"><span className="hidden md:inline">Nos spécialités, </span>Produits & Promotions</h2>
          </div>

          <div className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
            <Link href="/products" className="font-medium ">Voir tous les produits</Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="pb-16 container mx-auto px-8 md:px-4">
        <div className="mb-10 md:mb-20 px-6 md:px-10 lg:px-0">
          <div className="flex items-center justify-center bg-gradient-to-r from-[#d19268] to-[#ffe1c1] p-0 w-full gap-4 dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800 rounded-2xl overflow-hidden">
            <div className="w-[300px] md:w-[500px]  h-auto md:-my-10 object-cover">
              <img src="/images/produits/humberger.png" alt="pizza" className="w-full h-full object-cover"/>
            </div>
            <div >
              <div className="mb-3 text-3xl font-bold md:text-6xl text-[#6d4429] dark:text-white">Humberger</div>
              <Link href="/products" className="dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:border-2 dark:border-gray-600 dark:text-gray-200 rounded-xl px-6 py-2">
                  Voir les détails
              </Link>
              <p className="mt-3">Une délicieuse combinaison de saveurs et d'ingrédients frais !</p>
            </div>
          </div>
        </div>
        <div className="mb-10 md:mb-20 px-6 md:px-10 lg:px-0">
          <div className="flex items-center justify-center bg-gradient-to-r from-[#d19268] to-[#ffe1c1] p-0 w-full gap-4 dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800 rounded-2xl overflow-hidden">
            <div className="w-[300px] md:w-[500px]  h-auto md:-my-20 object-cover">
              <img src="/images/produits/baguette.png" alt="pizza" className="w-full h-full object-cover"/>
            </div>
            <div >
              <div className="mb-3 text-3xl font-bold md:text-6xl text-[#6d4429] dark:text-white">Notre Pizza</div>
              <Link href="/products" className="dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:border-2 dark:border-gray-600 dark:text-gray-200 rounded-xl px-6 py-2">
                  Voir les détails
              </Link>
              <p className="mt-3">Une délicieuse combinaison de saveurs et d'ingrédients frais !</p>
            </div>
          </div>
        </div>
        
      </section>
    </div>
  );
}