import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "../../../components/AddToCartButton";

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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <div className="text-3xl font-bold text-amber-700 mb-4">
              {product.price.toFixed(2)} €
            </div>
            <AddToCartButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}