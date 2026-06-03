"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";


interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  paymentMethod?: string | null;
  user: { name: string; email: string };
  items: { id: string; quantity: number; priceAtTime: number; product: { name: string } }[];
}

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterName, setFilterName] = useState("");

  const fetchOrders = async (userName: string = "") => {
    setLoading(true);
    const url = userName ? `/api/admin/orders?userName=${encodeURIComponent(userName)}` : "/api/admin/orders";
    const res = await fetch(url);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") fetchOrders();
  }, [session, status]);

  const handleSearch = () => { setFilterName(searchTerm); fetchOrders(searchTerm); };
  const handleReset = () => { setSearchTerm(""); setFilterName(""); fetchOrders(""); };

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Commande ${newStatus === "confirmed" ? "confirmée" : "annulée"}`);
      fetchOrders(filterName);
    } else toast.error("Erreur");
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Commande supprimée");
      fetchOrders(filterName);
    } else toast.error("Erreur suppression");
  };

  if (status !== "authenticated" || session?.user?.role !== "admin") return <div className="text-center py-8">Accès refusé</div>;
  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestion des commandes</h1>
        <div className="flex gap-2">
          <input type="text" placeholder="Nom de l'utilisateur" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field w-64" onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
          <button onClick={handleSearch} className="btn-primary">Rechercher</button>
          <button onClick={handleReset} className="btn-secondary">Réinitialiser</button>
        </div>
      </div>
      {orders.length === 0 ? <p>Aucune commande.</p> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div key={order.id} className="card p-4 border rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{order.user.name}</p>
                  <p className="text-sm text-gray-500">{order.user.email}</p>
                  <p className="text-sm">Date : {new Date(order.createdAt).toLocaleString()}</p>
                  <p className="text-sm">Paiement : {order.paymentMethod === "mpesa" ? "M-Pesa" : order.paymentMethod === "airtel" ? "Airtel Money" : "Orange Money"}</p>
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : order.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Annulée"}
                  </span>
                </div>
              </div>
              <ul className="text-sm list-disc list-inside mt-2">
                {order.items.map((item) => <li key={item.id}>{item.product.name} x {item.quantity} = {(item.priceAtTime * item.quantity).toFixed(2)} $</li>)}
              </ul>
              {order.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateStatus(order.id, "confirmed")} className="btn-primary text-sm py-1">Confirmer</button>
                  <button onClick={() => updateStatus(order.id, "cancelled")} className="btn-secondary bg-red-600 text-white text-sm py-1">Annuler</button>
                </div>
              )}
              <div className="mt-3">
                <button onClick={() => deleteOrder(order.id)} className="btn-secondary bg-red-600 text-white w-full">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}