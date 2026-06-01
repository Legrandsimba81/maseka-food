import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteProductButton from "../../../components/DeleteProductButton";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Nouveau produit
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Disponible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.price.toFixed(2)} €</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">
                  {product.isAvailable ? "✅ Oui" : "❌ Non"}
                </td>
                <td className="px-6 py-4 space-x-2">
                  <Link href={`/admin/products/${product.id}/edit`} className="text-blue-600 hover:underline">
                    Modifier
                  </Link>
                  <DeleteProductButton productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}