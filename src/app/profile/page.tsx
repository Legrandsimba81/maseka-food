"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, status]);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    if (res.ok) {
      setMessage("Profil mis à jour");
      update({ name });
      setEditMode(false);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Erreur lors de la mise à jour");
    }
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: getTotal(),
      }),
    });
    if (res.ok) {
      clearCart();
      toast.success("Commande validée !");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
  };

  // Données pour le graphique (commandes par mois)
  const last6Months = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ name: d.toLocaleString("fr", { month: "short" }), value: 0 });
    }
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const monthName = date.toLocaleString("fr", { month: "short" });
      const idx = months.findIndex((m) => m.name === monthName);
      if (idx !== -1) months[idx].value += order.totalAmount;
    });
    return months;
  };
  const chartData = last6Months();

  if (status === "loading" || loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container-custom py-8">
      <BackButton />
      <h1 className="text-3xl font-bold mb-8">Mon tableau de bord</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne gauche : infos et graphique */}
        <div className="lg:col-span-2 space-y-6">
          {/* Carte profil */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Informations personnelles</h2>
            </div>
            <div className="card-content">
              {editMode ? (
                <form onSubmit={updateProfile} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Nom</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="input-field mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-field mt-1" />
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">Enregistrer</button>
                    <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Annuler</button>
                  </div>
                  {message && <p className="text-green-600 text-sm">{message}</p>}
                </form>
              ) : (
                <div className="space-y-2">
                  <p><strong>Nom :</strong> {session?.user?.name}</p>
                  <p><strong>Email :</strong> {session?.user?.email}</p>
                  <button onClick={() => setEditMode(true)} className="btn-secondary">Modifier</button>
                </div>
              )}
            </div>
          </div>

          {/* Graphique des commandes */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Évolution des commandes</h2>
            </div>
            <div className="card-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Dernières commandes */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Dernières commandes</h2>
            </div>
            <div className="card-content">
              {orders.length === 0 ? (
                <p>Aucune commande pour le moment.</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="border-b pb-2">
                      <p className="text-sm text-muted-foreground">#{order.id.slice(0,8)} - {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="font-semibold">{order.totalAmount.toFixed(2)} $ - {order.status === "pending" ? "En attente" : "Confirmée"}</p>
                    </div>
                  ))}
                  {orders.length > 5 && <Link href="/orders" className="text-primary text-sm">Voir toutes</Link>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Colonne droite : Panier */}
        <div className="space-y-6">
          <div className="card sticky top-24">
            <div className="card-header">
              <h2 className="card-title">Mon panier</h2>
                          <Link href="/cart" className="text-gray-200 rounded-xl p-5 bg-gray-700 text-sm block mt-5 text-center">Ajouter des produits</Link>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}