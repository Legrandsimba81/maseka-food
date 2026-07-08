import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import ProductReviews from "@/components/ProductReviews";
import ShareButton from "@/components/ShareButtonProduit";
import { Metadata } from "next";

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!product) {
    return { title: "Produit introuvable" };
  }

  const title = `${product.name} - Maseka Food`;
  const description = product.description?.substring(0, 160) || "Découvrez nos produits de qualité chez Maseka Food";
  const imageUrl = product.imageUrl || "/images/produits/placeholder-bread.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl, width: 800, height: 600, alt: product.name }],
      siteName: "Maseka Food",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maseka-food.vercel.app";

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
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
              <div className="flex items-baseline gap-3 mb-6">
                {product.isPromo && product.promoPrice ? (
                  <>
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.price)} $
                    </span>
                    <span className="text-3xl font-bold text-primary">
                      {formatPrice(product.promoPrice)} $
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.price)} $
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <AddToCartButton productId={product.id} />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 text-center">
                  <p>Ajouté au panier ? Consultez votre <Link href="/profile" className="text-primary hover:underline">panier</Link>.</p>
                </div>
                <ShareButton
                  title={`${product.name} - Maseka Food`}
                  description={`Découvrez ${product.name} sur Maseka Food : ${product.description?.substring(0, 100)}...`}
                  url={`${baseUrl}/products/${product.id}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={product.id} />
    </div>
  );
}