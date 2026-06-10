"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { orders: number; reservations: number };
}

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [exchangeRate, setExchangeRate] = useState<number>(2300);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Charger les paramètres
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setExchangeRate(data.exchangeRate || 2300))
      .catch(err => console.error(err));
  }, []);

  // Charger les utilisateurs
  const fetchUsers = async () => {
    setLoadingUsers(true);
    const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`);
    if (res.ok) setUsers(await res.json());
    setLoadingUsers(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exchangeRate }),
    });
    if (res.ok) {
      toast.success("Taux de change mis à jour");
    } else {
      toast.error("Erreur");
    }
    setLoading(false);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Supprimer définitivement cet utilisateur ? Toutes ses commandes, réservations et messages seront également supprimés.")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } else {
      toast.error("Erreur");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Section Taux de change */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Taux de change</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Francs Congolais → Dollar US
            </label>
            <input
              type="number"
              step="1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="input-field w-64"
            />
            <p className="text-sm text-muted-foreground mt-1">
              1 USD = {exchangeRate} FC
            </p>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Section Utilisateurs */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
        <div className="mb-4 flex gap-2">
          <input
            type="text"
            placeholder="Filtrer par nom ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field flex-1"
          />
        </div>
        {loadingUsers ? (
          <p>Chargement...</p>
        ) : users.length === 0 ? (
          <p>Aucun utilisateur trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Nom</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Rôle</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Commandes</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Réservations</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Inscrit le</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">{user._count.orders}</td>
                    <td className="px-4 py-2">{user._count.reservations}</td>
                    <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}