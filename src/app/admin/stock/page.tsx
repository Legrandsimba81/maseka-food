"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

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
    status: "disponible",
    manufacturingDate: "",
    expirationDate: "",
  });
  const [saving, setSaving] = useState(false);
  const [isSkuManuallyEdited, setIsSkuManuallyEdited] = useState(false);

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
    if (res.ok) setProducts(await res.json());
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

  // Génération automatique du SKU
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
    
    // Validation des valeurs négatives
    const quantity = parseInt(form.quantity as any);
    const minStock = parseInt(form.minStock as any);
    const price = form.price ? parseFloat(form.price) : null;
    
    if (quantity < 0) {
      toast.error("La quantité ne peut pas être négative");
      return;
    }
    if (minStock < 0) {
      toast.error("Le stock minimum ne peut pas être négatif");
      return;
    }
    if (price !== null && price < 0) {
      toast.error("Le prix ne peut pas être négatif");
      return;
    }

    setSaving(true);
    const payload = {
      ...form,
      quantity,
      minStock,
      price,
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

  const editProduct = (product: StockProduct) => {
    openForm(product);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des stocks</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Ajouter un produit
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium">Recherche</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom, SKU, catégorie..."
              className="input-field w-full"
            />
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium">Catégorie</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field w-full">
              <option value="">Toutes</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium">Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-full">
              <option value="">Tous</option>
              <option value="disponible">Disponible</option>
              <option value="faible_stock">Stock faible</option>
              <option value="rupture">Rupture</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary">Rechercher</button>
            <button onClick={resetFilters} className="btn-secondary">Réinitialiser</button>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier" : "Ajouter"} un produit</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Nom *</label>
              <input
                value={form.name}
                onChange={handleNameChange}
                className="input-field"
                required
                placeholder="Ex: Pain complet, Croissant, Jus d'orange"
              />
              <p className="text-xs text-gray-400 mt-1">Le SKU sera généré automatiquement à partir du nom.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">SKU (Référence) *</label>
              <input
                value={form.sku}
                onChange={handleSkuChange}
                className="input-field"
                required
                placeholder="Généré automatiquement, modifiable"
              />
              <p className="text-xs text-gray-400 mt-1">Identifiant unique du produit.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Catégorie *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} className="input-field" required>
                <option value="">Sélectionner</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Ex: Pain, Pâtisserie, Boisson...</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Image</label>
              <ImageUpload
                onUpload={(url) => setForm({...form, imageUrl: url})}
                onRemove={() => setForm({...form, imageUrl: ""})}
                currentImage={form.imageUrl}
                label="Photo du produit"
              />
              <p className="text-xs text-gray-400 mt-1">Ajoutez une photo pour identifier plus facilement le produit.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Quantité en stock *</label>
              <input
                type="number"
                min="0"
                value={form.quantity}
                onChange={(e) => setForm({...form, quantity: parseInt(e.target.value) || 0})}
                className="input-field"
                required
                placeholder="0"
              />
              <p className="text-xs text-gray-400 mt-1">Nombre actuellement disponible (ne peut pas être négatif).</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Unité</label>
              <select value={form.unit} onChange={(e) => setForm({...form, unit: e.target.value})} className="input-field">
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              <p className="text-xs text-gray-400 mt-1">Ex: pièce, kg, litre...</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Stock minimum (alerte)</label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({...form, minStock: parseInt(e.target.value) || 0})}
                className="input-field"
                placeholder="5"
              />
              <p className="text-xs text-gray-400 mt-1">En dessous de ce seuil, le produit sera marqué "Stock faible".</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Prix de vente (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => setForm({...form, price: e.target.value})}
                className="input-field"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-400 mt-1">Prix unitaire de vente (facultatif).</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Statut</label>
              <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input-field">
                <option value="disponible">Disponible</option>
                <option value="faible_stock">Stock faible</option>
                <option value="rupture">Rupture</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Statut actuel du produit.</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Date de fabrication</label>
              <input
                type="date"
                value={form.manufacturingDate}
                onChange={(e) => setForm({...form, manufacturingDate: e.target.value})}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Pour les produits frais (pains, pâtisseries).</p>
            </div>
            <div>
              <label className="block text-sm font-medium">Date d'expiration</label>
              <input
                type="date"
                value={form.expirationDate}
                onChange={(e) => setForm({...form, expirationDate: e.target.value})}
                className="input-field"
              />
              <p className="text-xs text-gray-400 mt-1">Si applicable, à ne pas dépasser.</p>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Liste */}
      {loading ? (
        <p>Chargement...</p>
      ) : products.length === 0 ? (
        <p>Aucun produit en stock.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-gray-800 rounded-lg shadow">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">SKU</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Nom</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Catégorie</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Qté</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Unité</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Prix</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Statut</th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2 text-sm font-mono">{p.sku}</td>
                  <td className="px-4 py-2 text-sm font-medium">{p.name}</td>
                  <td className="px-4 py-2 text-sm">{p.category}</td>
                  <td className="px-4 py-2 text-sm">{p.quantity}</td>
                  <td className="px-4 py-2 text-sm">{p.unit}</td>
                  <td className="px-4 py-2 text-sm">{p.price ? p.price.toFixed(2) + " €" : "-"}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      p.status === "disponible" ? "bg-green-100 text-green-800" :
                      p.status === "faible_stock" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {p.status === "disponible" ? "Disponible" : p.status === "faible_stock" ? "Stock faible" : "Rupture"}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => editProduct(p)} className="text-blue-500 hover:text-blue-700"><Edit size={16} /></button>
                      <button onClick={() => deleteProduct(p.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}