import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const reservationsCount = await prisma.reservation.count();

  const recentOrders = await prisma.order.findMany({ take: 5, include: { user: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <p className="text-gray-500">Produits</p>
          <p className="text-3xl font-bold">{productsCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <p className="text-gray-500">Commandes</p>
          <p className="text-3xl font-bold">{ordersCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border">
          <p className="text-gray-500">Réservations</p>
          <p className="text-3xl font-bold">{reservationsCount}</p>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="p-4 border-b"><h2 className="text-lg font-semibold">Dernières commandes</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr><th className="px-4 py-2 text-left">Client</th><th className="px-4 py-2 text-left">Total</th><th className="px-4 py-2 text-left">Statut</th><th className="px-4 py-2 text-left">Date</th></tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b">
                  <td className="px-4 py-2">{order.user.name}</td>
                  <td className="px-4 py-2">{formatPrice(order.totalAmount)} $</td>
                  <td className="px-4 py-2">{order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Annulée"}</td>
                  <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}