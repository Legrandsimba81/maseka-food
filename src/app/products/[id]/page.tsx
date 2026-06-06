import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "../../../components/AddToCartButton";
import BackButton from "@/components/BackButton";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) notFound();

  return (
    <div className="container mx-auto px-4 py-8">

          <BackButton />

      <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#d19268] to-[#ffe1c1] dark:bg-gradient-to-r dark:from-gray-600 dark:to-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-64 md:h-auto">
            <Image
              src={product.imageUrl || "/images/produits/placeholder-bread.jpg"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="p-6 md:w-1/2">
            <h1 className="text-3xl font-bold mb-2 ">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
            <div className="text-3xl font-bold text-amber-700 dark:text-orange-500 mb-4">
              {formatPrice(product.price)} $
            </div>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
      <div className="m-5 text-center text-gray-400">
          <p>Si vous ajouter un produit dans votre panier veillez le consulter dans votre page profil.</p>
          <p>Voir mon <span><Link href="/profile">panier</Link></span></p>
      </div>

    </div>
  );
}