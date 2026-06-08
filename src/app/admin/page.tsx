import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { OrdersLineChart, OrdersPieChart } from "@/components/admin/Charts";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboard() {
  
  const session = await getServerSession(authOptions);
  
  // Vérification explicite
  if (!session) {
    console.log("❌ Aucune session, redirection vers login");
    redirect("/login");
  }
  if (!session.user) {
    console.log("❌ Session sans utilisateur");
    redirect("/login");
  }
  if (session.user.role !== "admin") {
    console.log(`❌ Utilisateur ${session.user.email} n'est pas admin (role: ${session.user.role})`);
    redirect("/login");
  }

  const productsCount = await prisma.product.count();
  const ordersCount = await prisma.order.count();
  const reservationsCount = await prisma.reservation.count();

  // Données pour le diagramme circulaire (statut des commandes)
  const orderStatus = await prisma.order.groupBy({ by: ["status"], _count: { status: true } });
  const pieData = orderStatus.map(s => ({
    name: s.status === "pending" ? "En attente" : s.status === "confirmed" ? "Confirmée" : "Terminée",
    value: s._count.status,
  }));

  // Données pour le diagramme en barres (commandes des 6 derniers mois)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  const ordersByMonth = await prisma.order.groupBy({
    by: ["createdAt"],
    where: { createdAt: { gte: sixMonthsAgo } },
    _count: { id: true },
  });
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const barData = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(); d.setMonth(d.getMonth() - i);
    const month = monthNames[d.getMonth()];
    const count = ordersByMonth.filter(o => new Date(o.createdAt).getMonth() === d.getMonth()).reduce((acc, cur) => acc + cur._count.id, 0);
    barData.unshift({ name: month, value: count });
  }

  const recentOrders = await prisma.order.findMany({ take: 5, include: { user: true }, orderBy: { createdAt: "desc" } });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 dark:border-gray-600 border-gray-200">
          <p className="text-gray-500">Produits</p>
          <p className="text-3xl font-bold">{productsCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 dark:border-gray-600 border-gray-200">
          <p className="text-gray-500">Commandes</p>
          <p className="text-3xl font-bold">{ordersCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 dark:border-gray-600 border-gray-200">
          <p className="text-gray-500">Réservations</p>
          <p className="text-3xl font-bold">{reservationsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 dark:border-gray-600 border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Commandes par mois</h2>
          {barData.some(d => d.value > 0) ? <OrdersLineChart data={barData} /> : <p className="text-gray-500">Aucune donnée</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border-2 dark:border-gray-600 border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Répartition des statuts</h2>
          {pieData.length ? <OrdersPieChart data={pieData} /> : <p className="text-gray-500">Aucune commande</p>}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-x-auto">
        <div className="p-4 border-b dark:border-gray-700"><h2 className="text-lg font-semibold">Dernières commandes</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Client</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Statut</th>
                <th className="px-4 py-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{order.user.name}</td>
                  <td className="px-4 py-2">{formatPrice(order.totalAmount)} $</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : order.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                      {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Terminée"}
                    </span>
                  </td>
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