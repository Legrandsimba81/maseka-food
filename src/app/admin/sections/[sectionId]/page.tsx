"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import { Plus, Minus, Package, DollarSign, Calendar, X } from "lucide-react";

export default function SectionDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.sectionId as string;

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [closing, setClosing] = useState(false);

  // Vérifier la session et le mot de passe
  useEffect(() => {
    if (session?.user?.role === "admin") {
      // Vérifier si le mot de passe est déjà stocké en session
      const stored = sessionStorage.getItem(`section_${sectionId}_auth`);
      if (stored === "true") {
        setIsAuthenticated(true);
        fetchData();
      }
    }
  }, [session, sectionId]);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/sections/${sectionId}/sales`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
      setTotal(data.total);
    }
    setLoading(false);
  };

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/sections/${sectionId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem(`section_${sectionId}_auth`, "true");
      setIsAuthenticated(true);
      fetchData();
    } else {
      toast.error("Mot de passe incorrect");
    }
  };

  const addSale = async (productId: number) => {
    const res = await fetch(`/api/admin/sections/${sectionId}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: 1 }),
    });
    if (res.ok) {
      toast.success("Vente ajoutée");
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const removeSale = async (productId: number) => {
    const res = await fetch(`/api/admin/sections/${sectionId}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: -1 }),
    });
    if (res.ok) {
      toast.success("Vente retirée");
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct),
    });
    if (res.ok) {
      toast.success("Produit ajouté");
      setShowProductForm(false);
      setNewProduct({ name: "", price: "" });
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    if (res.ok) {
      toast.success("Produit supprimé");
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const closeDay = async () => {
    if (!confirm("Clôturer la journée ? Les quantités seront réinitialisées à 0.")) return;
    setClosing(true);
    const res = await fetch(`/api/admin/sections/${sectionId}/close`, {
      method: "POST",
    });
    if (res.ok) {
      toast.success("Journée clôturée ! Rapport envoyé par email.");
      fetchData();
    } else {
      toast.error("Erreur lors de la clôture");
    }
    setClosing(false);
  };

  if (!session || session.user.role !== "admin") {
    return <div className="p-6 text-center text-red-500">Accès refusé</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold mb-4">Accès section</h1>
        <p className="text-gray-500 mb-4">Entrez le mot de passe pour accéder à cette section.</p>
        <form onSubmit={handleAuthenticate} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            className="input-field"
            required
          />
          <button type="submit" className="btn-primary w-full">Accéder</button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="p-6 text-center py-8">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">📊 Ventes du jour</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProductForm(!showProductForm)}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus size={18} /> Produit
          </button>
          <button
            onClick={closeDay}
            disabled={closing}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Calendar size={18} /> {closing ? "Clôture..." : "Clôturer"}
          </button>
        </div>
      </div>

      {showProductForm && (
        <form onSubmit={addProduct} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium">Nom</label>
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium">Prix ($)</label>
            <input
              type="number"
              step="0.01"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Ajouter</button>
          <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary">Annuler</button>
        </form>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Produit</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Prix unitaire</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Quantité</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Total</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-4 py-3 font-medium">{product.name}</td>
                <td className="px-4 py-3">{product.price.toFixed(2)} $</td>
                <td className="px-4 py-3">{product.quantity}</td>
                <td className="px-4 py-3 font-bold">{(product.quantity * product.price).toFixed(2)} $</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => addSale(product.id)} className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-sm">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeSale(product.id)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">
                    <Minus size={14} />
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="text-gray-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50 dark:bg-gray-700 font-bold">
              <td colSpan={3} className="px-4 py-3 text-right">TOTAL</td>
              <td className="px-4 py-3 text-lg text-green-600">{total.toFixed(2)} $</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}