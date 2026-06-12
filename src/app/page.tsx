// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Contener } from "@/components/contener";
import FoodBar from "@/components/foodBar";
import Image from "next/image";
import PromoCard from "@/components/PromoCard";
import PromoSlider from "@/components/PromoSlider";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import ArticleCard from "@/components/ArticleCard";
import { Calendar, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react";
import ArticleCardClient from "@/components/ArticleCardClient";



export const dynamic = 'force-dynamic';
const promoItems = [
  {
    imageSrc: "/images/produits/cake-birthday.png",
    title: "Cake of birthday",
    productId: "cmq0ywo9f00089ui3tn6rmk9a",
    description: "Un gâteau exceptionnel pour vos anniversaires",
  },
  {
    imageSrc: "/images/produits/pizza-15$.png",
    title: "Savoureux Pizza",
    productId: "cmq0ywoa8000o9ui3wqx1dch0",
    description: "Savourer notre Savoureux pizza artisanal",
  },
  {
    imageSrc: "/images/produits/donate-500fc-copy.png",
    title: "Donate",
    productId: "cmq0ywoap000z9ui304jfprok",
    description: "Savoureux donate artisanal",
  },
  {
    imageSrc: "/images/produits/hamburger-15$-copy.png",
    title: "Hamburger",
    productId: "cmq0ywoa9000p9ui394lhstha",
    description: "Savoureux burger artisanal",
  },

  // ...
];

// Ordre des catégories
const categoryOrder = ["burgers", "pizzas", "snacks"];
const PRODUCTS_PER_CATEGORY = 4;

export default async function Home() {
  // Récupérer tous les produits disponibles
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
  });

  // Grouper par catégorie
  const grouped: Record<string, typeof products> = {};
  for (const p of products) {
    if (!grouped[p.category]) grouped[p.category] = [];
    grouped[p.category].push(p);
  }

  // Sections
  const featured = categoryOrder
    .filter(cat => grouped[cat] && grouped[cat].length > 0)
    .map(cat => ({
      name: cat,
      products: grouped[cat].slice(0, PRODUCTS_PER_CATEGORY),
    }));

  // Dans la fonction du composant Home, après avoir récupéré les données
  const latestArticles = await prisma.article.findMany({
    take: 3, // 1 pour l'image principale + 2 pour la grille
    orderBy: { publishedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });
  const lastArticle = latestArticles[0];
  const remainingArticles = latestArticles.slice(1);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero */}
      <section className="flex bg-[url('/images/produits/fond-hero-copy-2.jpg')] dark:bg-[url('/images/produits/dark-mode-fond.jpg')] dark:custom-image bg-cover bg-center bg-no-repeat h-[400px] md:h-[500px] lg:h-[600px] w-full overflow-hidden lg:py-0 md:py-20 sm:py-20 py-10">
        <Contener className="flex items-center">
          <div className="w-[600px] h-auto hidden md:block">
            <img src="/images/produits/berger-plat.png" alt="Alia Kas et Isie pub maseka food promo" className="custom-image" />
          </div>

          <div className="text-center px-5 md:px-0 md:text-left">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight dark:text-white">maseka food<br />boulangerie</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
              Bienvenue chez maseka food !<br /> votre boulangerie de référence à <br /> Butembo. Découvrez nos pains artisanaux, viennoiseries dorées et pâtisseries gourmandes, préparés avec passion pour ravir vos papilles.
            </p>
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-4">
              <Link href="/products" className="hidden sm:block bg-orange-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-800 transition">Commander maintenant</Link>
              <Link href="/reservation" className="bg-orange-500/50 border border-orange-400 dark:text-white text-orange-950 px-6 py-3 rounded-xl font-medium dark:hover:bg-orange-900 hover:bg-orange-300 transition">Réserver une table</Link>
            </div>
          </div>
        </Contener>
      </section>

      <FoodBar />

      <PromoSlider items={promoItems} autoScrollInterval={6000} pauseOnHover />

      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Derniers articles</h2>

          {/* Image principale (cliquable) - uniquement l'image */}
          {lastArticle && (
            <Link href={`/articles/${lastArticle.slug}`} className="block mb-12">
              <div className="relative w-full h-96 overflow-hidden rounded-xl shadow-lg">
                {lastArticle.imageMain ? (
                  <img src={lastArticle.imageMain} alt={lastArticle.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                    Aucune image
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Grille des deux articles suivants (le dernier article apparaît aussi dans la grille si vous le souhaitez) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {remainingArticles.map((article) => (
              <ArticleCardClient key={article.id} article={article} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/articles" className="btn-primary">Voir tous les articles →</Link>
          </div>
        </div>
      </section>

      {/* Produits vedettes */}
      <section className=" md:pt-14 container mx-auto px-8 md:px-4">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl text-[#6d4429] dark:text-white font-bold sm:text-center"><span className="hidden md:inline">Nos spécialités, </span>Produits & Promotions</h2>
          </div>
          <div className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl">
            <Link href="/products" className="font-medium">Voir tous les produits</Link>
          </div>
        </div>
      </section>

      {featured.map((section) => (
        <section key={section.name} className="pb-8 container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6 capitalize">{section.name}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {section.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8">
            <a href={`/products?category=${section.name}`} className="text-amber-600 hover:underline">
              Voir tous les {section.name} →
            </a>
          </div>
        </section>
      ))}

      <PromoSlider items={promoItems} autoScrollInterval={6000} pauseOnHover />
      {/* <div className="mt-8"></div> */}
      <ServicesSection />
      <AboutSection />

    </div>
  );
}