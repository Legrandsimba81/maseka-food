"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import { Search, Plus, Edit, Trash2, AlertCircle, MoveRight, Filter } from "lucide-react";
import Link from "next/link";

interface StockProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  imageUrl: string | null;
  quantity: number;
  unit: string;
  minStock: number;
  price: number | null;
  purchasePrice: number | null;
  status: string;
  manufacturingDate: string | null;
  expirationDate: string | null;
  updatedAt: string;
  createdAt: string;
}

const categories = ["Pain", "Pâtisserie", "Boisson", "Snack", "Viennoiserie", "Sandwich", "Autre"];
const units = ["pièce", "kg", "litre", "boîte", "paquet"];

export default function AdminStockPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    sku: "",
    name: "",
    category: "",
    imageUrl: "",
    quantity: 0,
    unit: "pièce",
    minStock: 5,
    price: "",
    purchasePrice: "",
    status: "disponible",
    manufacturingDate: "",
    expirationDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);
  const [alertProducts, setAlertProducts] = useState<StockProduct[]>([]);
  const [showFilters, setShowFilters] = useState(false); // Toggle pour les filtres sur mobile

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);
    const res = await fetch(`/api/admin/stock?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
      setAlertProducts(data.filter((p: StockProduct) => p.status === "faible_stock" || p.status === "rupture"));
    }
    setLoading(false);
  };

  const handleSearch = () => fetchProducts();
  const resetFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("");
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    const res = await fetch(`/api/admin/stock/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Produit supprimé");
      fetchProducts();
    } else toast.error("Erreur");
  };

  const generateSKU = (name: string): string => {
    if (!name || name.trim() === "") return "";
    const words = name.trim().split(/\s+/);
    let prefix = words.map(word => word.charAt(0).toUpperCase()).join("");
    if (prefix.length > 4) prefix = prefix.substring(0, 4);
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}`;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setForm({ ...form, name: newName });
    if (!isSkuManuallyEdited) {
      setForm(prev => ({ ...prev, sku: generateSKU(newName) }));
    }
  };

  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, sku: e.target.value });
    setIsSkuManuallyEdited(true);
  };

  const openForm = (product?: StockProduct) => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        category: product.category,
        imageUrl: product.imageUrl || "",
        quantity: product.quantity,
        unit: product.unit,
        minStock: product.minStock,
        price: product.price?.toString() || "",
        purchasePrice: product.purchasePrice?.toString() || "",
        status: product.status,
        manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString().split("T")[0] : "",
        expirationDate: product.expirationDate ? new Date(product.expirationDate).toISOString().split("T")[0] : "",
      });
      setEditingId(product.id);
      setIsSkuManuallyEdited(true);
    } else {
      setForm({
        sku: "",
        name: "",
        category: "",
        imageUrl: "",
        quantity: 0,
        unit: "pièce",
        minStock: 5,
        price: "",
        purchasePrice: "",
        status: "disponible",
        manufacturingDate: "",
        expirationDate: "",
      });
      setEditingId(null);
      setIsSkuManuallyEdited(false);
    }
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const quantity = parseInt(form.quantity as any);
    const minStock = parseInt(form.minStock as any);
    const price = form.price ? parseFloat(form.price) : null;
    const purchasePrice = form.purchasePrice ? parseFloat(form.purchasePrice) : null;
    
    if (quantity < 0) {
      toast.error("La quantité ne peut pas être négative");
      return;
    }
    if (minStock < 0) {
      toast.error("Le stock minimum ne peut pas être négatif");
      return;
    }
    if (price !== null && price < 0) {
      toast.error("Le prix de vente ne peut pas être négatif");
      return;
    }
    if (purchasePrice !== null && purchasePrice < 0) {
      toast.error("Le prix d'achat ne peut pas être négatif");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      quantity,
      minStock,
      price,
      purchasePrice,
    };
    const url = editingId ? `/api/admin/stock/${editingId}` : "/api/admin/stock";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success(editingId ? "Produit modifié" : "Produit ajouté");
      setShowForm(false);
      setEditingId(null);
      setForm({
        sku: "",
        name: "",
        category: "",
        imageUrl: "",
        quantity: 0,
        unit: "pièce",
        minStock: 5,
        price: "",
        purchasePrice: "",
        status: "disponible",
        manufacturingDate: "",
        expirationDate: "",
      });
      setIsSkuManuallyEdited(false);
      fetchProducts();
    } else {
      toast.error("Erreur");
    }
    setSaving(false);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  const totalStockValue = products.reduce((sum, p) => sum + (p.purchasePrice || 0) * p.quantity, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Alertes */}
      {alertProducts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-700 dark:text-red-300">Alertes stock</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {alertProducts.filter(p => p.status === "rupture").length} produit(s) en rupture,
                {alertProducts.filter(p => p.status === "faible_stock").length} produit(s) en stock faible.
              </p>
              <ul className="text-sm mt-1 space-y-1">
                {alertProducts.slice(0, 5).map(p => (
                  <li key={p.id} className="text-red-600 dark:text-red-400">
                    • {p.name} - {p.quantity} {p.unit} restant(s)
                    {p.status === "rupture" && " (RUPTURE)"}
                    {p.status === "faible_stock" && ` (seuil: ${p.minStock})`}
                  </li>
                ))}
                {alertProducts.length > 5 && (
                  <li className="text-xs text-gray-500">+ {alertProducts.length - 5} autres alertes</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestion des stocks</h1>
          <p className="text-sm text-gray-500">Valeur totale du stock : {totalStockValue.toFixed(2)} $</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/stock/movements" className="btn-secondary flex items-center gap-2 text-sm px-3 py-2">
            <MoveRight size={18} /> <span className="hidden sm:inline">Mouvements</span>
          </Link>
          <button onClick={() => openForm()} className="btn-primary flex items-center gap-2 text-sm px-3 py-2">
            <Plus size={18} /> <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Bouton toggle filtres (mobile) */}
      <div className="md:hidden mb-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium"
        >
          <Filter size={18} />
          {showFilters ? "Masquer les filtres" : "Filtres"}
        </button>
      </div>

      {/* Filtres */}
      <div className={`${showFilters ? 'block' : 'hidden'} md:block bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 transition-all`}>
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium">Recherche</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, SKU, catégorie..."
              className="input-field w-full text-sm"
            />
          </div>
          <div className="w-36 sm:w-40">
            <label className="block text-sm font-medium">Catégorie</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-full text-sm">
              <option value="">Toutes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-36 sm:w-40">
            <label className="block text-sm font-medium">Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full text-sm">
              <option value="">Tous</option>
              <option value="disponible">Disponible</option>
              <option value="faible_stock">Stock faible</option>
              <option value="rupture">Rupture</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary text-sm px-4 py-2">Rechercher</button>
            <button onClick={resetFilters} className="btn-secondary text-sm px-4 py-2">Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier" : "Ajouter"} un produit</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nom *</label>
              <input
                value={form.name}
                onChange={handleNameChange}
                className="input-field text-sm"
                required
                placeholder="Ex: Pain complet, Croissant..."
              />
              <p className="text-xs text-gray-400 mt-1">Le SKU sera généré automatiquement.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">SKU (Référence) *</label>
              <input
                value={form.sku}
                onChange={handleSkuChange}
                className="input-field text-sm"
                required
                placeholder="Généré automatiquement"
              />
              <p className="text-xs text-gray-400 mt-1">Identifiant unique.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Catégorie *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field text-sm" required>
                <option value="">Sélectionner</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <ImageUpload
                onUpload={(url) => setForm({...form, imageUrl: url})}
                onRemove={() => setForm({...form, imageUrl: ""})}
                currentImage={form.imageUrl}
                label="Photo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Quantité *</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                className="input-field text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Unité</label>
              <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="input-field text-sm">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Stock minimum</label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({...form, minStock: parseInt(e.target.value) || 0})}
                className="input-field text-sm"
                placeholder="5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Prix achat unitaire ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.purchasePrice}
                onChange={(e) => setForm({...form, purchasePrice: e.target.value})}
                className="input-field text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Prix vente unitaire ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                className="input-field text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Statut</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field text-sm">
                <option value="disponible">Disponible</option>
                <option value="faible_stock">Stock faible</option>
                <option value="rupture">Rupture</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Date fabrication</label>
              <input
                type="date"
                value={form.manufacturingDate}
                onChange={(e) => setForm({...form, manufacturingDate: e.target.value})}
                className="input-field text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Date expiration</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({...form, expirationDate: e.target.value})}
                className="input-field text-sm"
              />
            </div>
            <div className="sm:col-span-2 flex flex-wrap gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : products.length === 0 ? (
        <p className="text-center py-8">Aucun produit en stock.</p>
      ) : (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">SKU</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Nom</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase hidden sm:table-cell">Catégorie</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Qté</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase hidden sm:table-cell">Unité</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase hidden md:table-cell">Prix achat</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase hidden md:table-cell">Prix vente</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase hidden md:table-cell">Valeur</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Statut</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const stockValue = p.purchasePrice ? p.quantity * p.purchasePrice : 0;
                return (
                  <tr key={p.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-3 py-2 font-mono text-xs">{p.sku}</td>
                    <td className="px-3 py-2 font-medium">{p.name}</td>
                    <td className="px-3 py-2 hidden sm:table-cell">{p.category}</td>
                    <td className="px-3 py-2">{p.quantity}</td>
                    <td className="px-3 py-2 hidden sm:table-cell">{p.unit}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{p.purchasePrice ? p.purchasePrice.toFixed(2) + " $" : "-"}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{p.price ? p.price.toFixed(2) + " $" : "-"}</td>
                    <td className="px-3 py-2 hidden md:table-cell">{stockValue > 0 ? stockValue.toFixed(2) + " $" : "-"}</td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full whitespace-nowrap ${
                        p.status === "disponible" ? "bg-green-100 text-green-800" :
                        p.status === "faible_stock" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {p.status === "disponible" ? "Disponible" : p.status === "faible_stock" ? "Stock faible" : "Rupture"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-1 items-center">
                        <Link href={`/admin/stock/movements?productId=${p.id}`} className="text-blue-500 hover:text-blue-700" title="Mouvements">
                          <MoveRight size={16} />
                        </Link>
                        <button onClick={() => openForm(p)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                        <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}