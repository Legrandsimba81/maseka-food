"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Store, Calendar, Package, Settings, X, Edit, Trash2, Save } from "lucide-react";

export default function SectionsPage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManagement, setShowManagement] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", password: "" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchSections();
    }
  }, [session]);

  const fetchSections = async () => {
    const res = await fetch("/api/admin/sections");
    if (res.ok) {
      setSections(await res.json());
    }
    setLoading(false);
  };

  if (!session || session.user.role !== "admin") {
    return <div className="p-6 text-center text-red-500">Accès refusé</div>;
  }

  const startEdit = (section: any) => {
    setEditingId(section.id);
    setEditForm({
      name: section.name,
      description: section.description || "",
      password: "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: "", description: "", password: "" });
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });
    if (res.ok) {
      toast.success("Section modifiée");
      setEditingId(null);
      fetchSections();
    } else {
      toast.error("Erreur");
    }
  };

  const requestDelete = async (id: string) => {
    if (!confirm("Envoyer un email de confirmation pour supprimer cette section ?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/sections/${id}/delete-request`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Email de confirmation envoyé ! Vérifiez votre boîte mail.");
    } else {
      toast.error("Erreur");
    }
    setDeletingId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sections (vos points de vente)</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowManagement(!showManagement)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={18} /> {showManagement ? "Fermer gestion" : "Gérer les sections"}
          </button>
          <Link href="/admin/sections/new" className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Nouvelle section
          </Link>
        </div>
      </div>

      {showManagement && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings size={20} /> Gestion des sections
          </h2>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border-b dark:border-gray-700 pb-4 last:border-0">
                {editingId === section.id ? (
                  <div className="space-y-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="input-field"
                      placeholder="Nom"
                    />
                    <input
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="input-field"
                      placeholder="Description"
                    />
                    <input
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                      className="input-field"
                      placeholder="Nouveau mot de passe (laisser vide pour ne pas changer)"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => saveEdit(section.id)} className="btn-primary flex items-center gap-2">
                        <Save size={16} /> Enregistrer
                      </button>
                      <button onClick={cancelEdit} className="btn-secondary">Annuler</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold">{section.name}</h3>
                      {section.description && <p className="text-sm text-gray-500">{section.description}</p>}
                      <p className="text-xs text-gray-400">Produits: {section._count.products} | Rapports: {section._count.dailySales}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(section)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => requestDelete(section.id)}
                        disabled={deletingId === section.id}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : sections.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucune section créée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Store size={20} className="text-orange-500" />
                <h2 className="text-xl font-bold">{section.name}</h2>
              </div>
              {section.description && <p className="text-sm text-gray-500 mb-2">{section.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Package size={14} /> {section._count.products} produits</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {section._count.dailySales} rapports</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/sections/${section.id}`} className="btn-primary text-sm py-1 px-3">Dashboard</Link>
                <Link href={`/admin/sections/${section.id}/history`} className="btn-secondary text-sm py-1 px-3">Historique</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}