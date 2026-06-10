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
  const [usersLoading, setUsersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Charger les paramètres
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setExchangeRate(data.exchangeRate || 2300));
  }, []);

  // Charger les utilisateurs
  const fetchUsers = async () => {
    setUsersLoading(true);
    const res = await fetch("/api/admin/users");
    if (res.ok) setUsers(await res.json());
    setUsersLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exchangeRate }),
    });
    if (res.ok) toast.success("Taux de change mis à jour");
    else toast.error("Erreur");
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Supprimer définitivement cet utilisateur (commandes, réservations, messages...) ?")) return;
    const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } else toast.error("Erreur");
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres de la boulangerie</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Taux de change</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Taux de change (Francs Congolais → Dollar US)
            </label>
            <input
              type="number"
              step="1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="input-field max-w-xs"
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

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Gestion des utilisateurs</h2>
        <div className="mb-4">
          <input
            type="text"
            placeholder="Filtrer par nom ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field max-w-md"
          />
        </div>
        {usersLoading ? (
          <p>Chargement...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left">Nom</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Rôle</th>
                  <th className="px-4 py-2 text-center">Commandes</th>
                  <th className="px-4 py-2 text-center">Réservations</th>
                  <th className="px-4 py-2 text-center">Inscrit le</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="border-b dark:border-gray-700">
                    <td className="px-4 py-2">{user.name}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.role === "admin" ? "Admin" : "Utilisateur"}</td>
                    <td className="px-4 py-2 text-center">{user._count.orders}</td>
                    <td className="px-4 py-2 text-center">{user._count.reservations}</td>
                    <td className="px-4 py-2 text-center">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={user.role === "admin"}
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