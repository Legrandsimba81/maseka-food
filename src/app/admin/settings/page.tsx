"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

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
  const [heroImage, setHeroImage] = useState("");
  const [heroImageTemp, setHeroImageTemp] = useState("");
  const [loading, setLoading] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Charger les paramètres
  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setExchangeRate(data.exchangeRate || 2300);
        setHeroImage(data.heroImage || "");
        setHeroImageTemp(data.heroImage || "");
      })
      .catch(err => console.error(err));
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      } else {
        toast.error("Erreur chargement utilisateurs");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  // Sauvegarde du taux de change
  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/settings/exchange", {
      method: "POST",
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

  // Sauvegarde de l'image de bannière
  const saveHeroImage = async () => {
    if (heroImageTemp === heroImage) {
      toast("Aucun changement", { icon: "ℹ️" });
      return;
    }
    setSavingHero(true);
    const res = await fetch("/api/settings/hero", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ heroImage: heroImageTemp }),
    });
    if (res.ok) {
      setHeroImage(heroImageTemp);
      toast.success("Image de bannière mise à jour");
    } else {
      toast.error("Erreur");
    }
    setSavingHero(false);
  };

  const deleteUser = async (id: string, role: string) => {
    if (role === "admin") {
      toast.error("Suppression d'un administrateur non autorisée");
      return;
    }
    if (!confirm("Supprimer définitivement cet utilisateur ?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Utilisateur supprimé");
      fetchUsers();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    if (id === session?.user?.id) {
      toast.error("Vous ne pouvez pas modifier votre propre rôle");
      return;
    }
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      toast.success(`Rôle modifié : ${newRole === "admin" ? "Admin" : "Utilisateur"}`);
      fetchUsers();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
  };
  const [stats, setStats] = useState({
    totalViews: 0,
    todayViews: 0,
    monthViews: 0,
    uniqueVisitorsTotal: 0,
    uniqueVisitorsToday: 0,
    uniqueVisitorsMonth: 0,
  });

  // Ajoutez ces états
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    fetch("/api/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);
  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Paramètres</h1>

      {/* Taux de change */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Taux de change</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Francs Congolais → Dollar US</label>
            <input
              type="number"
              step="1"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(Number(e.target.value))}
              className="input-field w-64"
            />
            <p className="text-sm text-muted-foreground mt-1">1 USD = {exchangeRate} FC</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn-primary">
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Image de bannière (accueil) */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Image de bannière (accueil)</h2>
        {isClient && (
          <ImageUploadWithCrop
            label="Image de la bannière"
            onUpload={(url) => setHeroImageTemp(url)}
            onRemove={() => setHeroImageTemp("")}
            currentImage={heroImageTemp || heroImage}
            aspect={16 / 9}
          />
        )}
        {heroImageTemp !== heroImage && (
          <button
            onClick={saveHeroImage}
            className="btn-primary mt-4"
            disabled={savingHero}
          >
            {savingHero ? "Enregistrement..." : "Enregistrer l'image"}
          </button>
        )}
        <p className="text-sm text-muted-foreground mt-2">
          Cette image s'affichera sur la page d'accueil. Cliquez sur l'image pour l'agrandir.
        </p>
      </div>

      // Dans le JSX, ajoutez cette nouvelle section
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Contacter les clients</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!emailSubject || !emailMessage) {
              toast.error("Sujet et message requis");
              return;
            }
            setSendingEmail(true);
            try {
              const res = await fetch("/api/admin/send-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: selectedUserId || "all",
                  subject: emailSubject,
                  message: emailMessage,
                }),
              });
              if (res.ok) {
                toast.success("Email(s) envoyé(s)");
                setEmailSubject("");
                setEmailMessage("");
                setSelectedUserId("");
              } else {
                const err = await res.json();
                toast.error(err.error || "Erreur");
              }
            } catch (err) {
              toast.error("Erreur réseau");
            }
            setSendingEmail(false);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Destinataire</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field w-full"
                required
              >
                <option value="">Sélectionner un client</option>
                <option value="all">Tous les clients</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sujet</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                rows={5}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <button type="submit" disabled={sendingEmail} className="btn-primary w-full">
              {sendingEmail ? "Envoi..." : "Envoyer"}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Statistiques de visite</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Pages vues (total)</p>
            <p className="text-2xl font-bold">{stats.totalViews}</p>
          </div>
          <div>
            <p className="text-gray-500">Aujourd'hui</p>
            <p className="text-2xl font-bold">{stats.todayViews}</p>
          </div>
          <div>
            <p className="text-gray-500">Ce mois-ci</p>
            <p className="text-2xl font-bold">{stats.monthViews}</p>
          </div>
          <div>
            <p className="text-gray-500">Visiteurs uniques (total)</p>
            <p className="text-2xl font-bold">{stats.uniqueVisitorsTotal}</p>
          </div>
          <div>
            <p className="text-gray-500">Visiteurs uniques aujourd'hui</p>
            <p className="text-2xl font-bold">{stats.uniqueVisitorsToday}</p>
          </div>
          <div>
            <p className="text-gray-500">Visiteurs uniques ce mois-ci</p>
            <p className="text-2xl font-bold">{stats.uniqueVisitorsMonth}</p>
          </div>
        </div>
      </div>

      {/* Gestion utilisateurs */}
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
              <tbody>
                {users.map((user) => {
                  const isSuperAdmin = user.email === "admin@masekafood.com";
                  return (
                    <tr key={user.id}>
                      <td className="px-4 py-2">{user.name}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2 capitalize">{user.role}</td>
                      <td className="px-4 py-2">{user._count.orders}</td>
                      <td className="px-4 py-2">{user._count.reservations}</td>
                      <td className="px-4 py-2">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-2">
                        {isSuperAdmin ? (
                          <span className="text-sm text-amber-600 font-semibold">Super Admin</span>
                        ) : (
                          <div className="space-x-2">
                            {user.role === "admin" ? (
                              <button
                                onClick={() => changeRole(user.id, "user")}
                                className="text-amber-600 hover:text-amber-800 text-sm"
                              >
                                Retirer admin
                              </button>
                            ) : (
                              <button
                                onClick={() => changeRole(user.id, "admin")}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                Promouvoir admin
                              </button>
                            )}
                            <button
                              onClick={() => deleteUser(user.id, user.role)}
                              className="text-red-600 hover:text-red-800 text-sm ml-2"
                              disabled={user.role === "admin"}
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}