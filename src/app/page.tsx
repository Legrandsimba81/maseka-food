// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({ take: 4, where: { isAvailable: true } });
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-amber-50 overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight">Pain frais,<br/>fait avec passion</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">Découvrez nos pains au levain, viennoiseries croustillantes et pâtisseries artisanales.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/products" className="bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition">Commander maintenant</Link>
            <Link href="/reservation" className="border border-black text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition">Réserver une table</Link>
          </div>
        </div>
      </section>
      {/* Produits vedettes */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Nos spécialités</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>
    </div>
  );
}