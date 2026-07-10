import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import PromotionsClient from "./PromotionsClient";

// Métadonnées SEO / partage
export const metadata: Metadata = {
  title: "Offres spéciales - Maseka Food",
  description: "Profitez de nos promotions exceptionnelles sur toute la carte avant qu'elles ne disparaissent !",
  openGraph: {
    title: "Offres spéciales - Maseka Food",
    description: "Profitez de nos promotions exceptionnelles avant qu'elles ne disparaissent !",
    images: [
      {
        url: "/images/promo.jpg",
        width: 1200,
        height: 630,
        alt: "Promotions Maseka Food",
      },
    ],
    siteName: "Maseka Food",
    url: "https://maseka-food.vercel.app/promotions",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Offres spéciales - Maseka Food",
    description: "Profitez de nos promotions exceptionnelles avant qu'elles ne disparaissent !",
    images: ["/images/promo.jpg"],
  },
  alternates: {
    canonical: "https://maseka-food.vercel.app/promotions",
  },
};

export default async function PromotionsPage() {
  // Récupération des produits en promotion (côté serveur)
  const products = await prisma.product.findMany({
    where: {
      isPromo: true,
      isAvailable: true,
    },
    orderBy: { name: "asc" },
  });

  // Passage des données au composant client
  return <PromotionsClient initialProducts={products} />;
}