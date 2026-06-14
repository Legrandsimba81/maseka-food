"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
import { formatPrice } from "@/lib/format";
import { User } from "lucide-react";

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
  const [uploading, setUploading] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const avatarUrl = session?.user?.avatarUrl || session?.user?.image;

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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 2 Mo");
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    setUploading(true);
    try {
      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        toast.success("Avatar mis à jour");
        await update();
        window.location.reload();
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }
    setUploading(false);
  };

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

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    const res = await fetch("/api/user/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Mot de passe modifié");
      setChangePasswordMode(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(data.error || "Erreur");
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 mb-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
          ) : (
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User size={40} className="text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">Bonjour, {session?.user?.name}</h1>
            {/* Email affiché uniquement ici (pas à côté du nom) */}
          </div>
        </div>
        <div>
          <label className="btn-secondary cursor-pointer">
            {uploading ? "Envoi..." : "Changer l'avatar"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Informations personnelles</h2>
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
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditMode(true)} className="btn-secondary">Modifier</button>
                  <button onClick={() => setChangePasswordMode(true)} className="btn-secondary">Changer le mot de passe</button>
                </div>
              </div>
            )}
            {changePasswordMode && (
              <form onSubmit={changePassword} className="mt-4 space-y-3 border-t pt-4">
                <div>
                  <label className="text-sm font-medium">Mot de passe actuel</label>
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="input-field mt-1" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Nouveau mot de passe</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-field mt-1" required />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirmer le mot de passe</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field mt-1" required />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">Changer</button>
                  <button type="button" onClick={() => setChangePasswordMode(false)} className="btn-secondary">Annuler</button>
                </div>
              </form>
            )}
          </div>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Évolution des commandes</h2>
            {orders.length === 0 ? (
              <p className="text-muted-foreground">Aucune commande pour le moment.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toFixed(2)} $`} />
                  <Bar dataKey="value" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Dernières commandes</h2>
            {orders.length === 0 ? (
              <p>Aucune commande pour le moment.</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="border-b pb-2">
                    <p className="text-sm text-muted-foreground">#{order.id.slice(0,8)} - {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="font-semibold">{formatPrice(order.totalAmount)} $ - {order.status === "pending" ? "En attente" : "Confirmée"}</p>
                  </div>
                ))}
                {orders.length > 5 && <Link href="/orders" className="text-primary text-sm">Voir toutes</Link>}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Mon panier</h2>
            {items.length === 0 ? (
              <p className="text-muted-foreground">Votre panier est vide.</p>
            ) : (
              <>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.productId} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-0 border rounded">-</button>
                          <span className="text-sm">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-0 border rounded">+</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <p>{formatPrice(item.price * item.quantity)} $</p>
                        <button onClick={() => removeFromCart(item.productId)} className="text-red-500 text-xs">Supprimer</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())} $</span>
                  </div>
                  <button onClick={handleCheckout} className="btn-primary w-full mt-4">Valider la commande</button>
                  <button onClick={clearCart} className="btn-secondary w-full mt-2">Vider le panier</button>
                </div>
              </>
            )}
            <Link href="/products" className="text-primary text-sm block mt-4 text-center">Ajouter des produits</Link>
          </div>
        </div>
      </div>
    </div>
  );
}