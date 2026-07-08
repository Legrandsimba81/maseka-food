import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteProductButton from "../../../components/DeleteProductButton";
import { formatPrice } from "@/lib/format";
import { ProductFilters } from "@/components/ProductFilters";

// Définition des catégories avec leurs icônes (as const pour le typage strict)
const categoriesWithIcons = [
  { id: "pains", label: "Pains", icon: "Wheat" },
  { id: "viennoiseries", label: "Viennoiseries", icon: "Croissant" },
  { id: "pâtisseries", label: "Pâtisseries", icon: "Cake" },
  { id: "sandwichs", label: "Sandwichs", icon: "Sandwich" },
  { id: "pizzas", label: "Pizzas", icon: "Pizza" },
  { id: "burgers", label: "Burgers", icon: "Hamburger" },
  { id: "snacks", label: "Snacks", icon: "Popcorn" },
  { id: "boissons", label: "Boissons", icon: "Coffee" },
] as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { search?: string; category?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/login");

  // Récupération des filtres depuis l'URL
  const search = searchParams?.search || "";
  const category = searchParams?.category || "";

  // Construction de la clause WHERE
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) {
    where.category = category;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return (
    <div className="container dark:bg-gray-900 mx-auto px-4 py-8">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion des produits</h1>
        <Link href="/admin/products/new" className="btn-primary">
          + Nouveau produit
        </Link>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6">
        <ProductFilters
          categoriesWithIcons={categoriesWithIcons}
          currentCategory={category}
          currentSearch={search}
        />
      </div>

      <div className="bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Prix</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Disponible</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{formatPrice(product.price)} $</td>
                <td className="px-6 py-4">{product.category}</td>
                <td className="px-6 py-4">
                  {product.isAvailable ? "Oui" : "Non"}
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