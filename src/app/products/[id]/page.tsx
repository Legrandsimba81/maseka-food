import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import ProductReviews from "@/components/ProductReviews";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <BackButton />

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden mt-4">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-72 md:h-[400px] bg-gray-100 dark:bg-gray-700">
            <Image
              src={product.imageUrl || "/images/produits/placeholder-bread.jpg"}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="p-6 md:w-1/2 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {product.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base mb-4">
                {product.description}
              </p>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)} $
                </span>
                {product.isPromo && product.promoPrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPrice(product.promoPrice)} $
                  </span>
                )}
              </div>
            </div>
            <AddToCartButton productId={product.id} />
            <div className="mt-4 text-sm text-gray-500 text-center">
              <p>Ajouté au panier ? Consultez votre <Link href="/profile" className="text-primary hover:underline">panier</Link>.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section avis */}
      <ProductReviews productId={product.id} />
    </div>
  );
}