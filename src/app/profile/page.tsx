"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";
import BackButton from "@/components/BackButton";
import { formatPrice } from "@/lib/format";
import { BookOpen, User, Calendar, ShoppingBag } from "lucide-react";

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
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
    } catch {
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

  // Récupérer la date d'inscription depuis session.user.createdAt (si disponible)
  // Ou depuis la base via une API (on suppose que le champ existe)
  const memberSince = session?.user?.createdAt
  ? new Date(session.user.createdAt).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  : "Date inconnue";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <BackButton />

      {/* En‑tête du profil (pleine largeur) */}
      <div className="mt-4 mb-8 border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-6 bg-gradient-to-r from-transparent to-amber-50/30 dark:to-gray-800/30 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover ring-2 ring-amber-500/30" />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ring-2 ring-amber-500/30">
              <User size={32} className="text-gray-500" />
            </div>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
              Bonjour, {session?.user?.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5">
              {session?.user?.email}
            </p>
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Calendar size={14} /> Membre depuis le {memberSince}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn-secondary cursor-pointer text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2">
            {uploading ? "Envoi..." : "Changer l'avatar"}
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
          </label>
          <Link href="/cart" className="btn-primary flex items-center gap-2 text-sm sm:text-base px-4 py-2">
            <ShoppingBag size={18} /> Mon panier
          </Link>
        </div>
      </div>

      {/* Corps à deux colonnes sur grand écran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colonne gauche : Informations personnelles + changement mot de passe */}
        <div className="space-y-6">
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
                <p><strong>Membre depuis :</strong> {memberSince}</p>
                <div className="flex flex-wrap gap-2 mt-4">
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

          {/* Carte "Guide d'utilisation" */}
          <Link href="/guide" className="block border-2 border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-md transition hover:border-amber-300 dark:hover:border-amber-700">
            <div className="flex items-start gap-3">
              <BookOpen size={28} className="text-amber-600 dark:text-amber-400 mt-1" />
              <div>
                <h3 className="text-lg font-semibold">Guide d'utilisation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Découvrez les fonctionnalités clés de l'application, gérez vos commandes, votre profil et bien plus encore.
                </p>
                <span className="text-primary text-sm font-medium mt-1 inline-block">Cliquez pour en savoir plus →</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Colonne droite : Graphique + Dernières commandes */}
        <div className="space-y-6">
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
                    <p className="text-sm text-muted-foreground">#{order.id.slice(0, 8)} - {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="font-semibold">{formatPrice(order.totalAmount)} $ - {order.status === "pending" ? "En attente" : "Confirmée"}</p>
                  </div>
                ))}
                {orders.length > 5 && <Link href="/orders" className="text-primary text-sm">Voir toutes</Link>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}