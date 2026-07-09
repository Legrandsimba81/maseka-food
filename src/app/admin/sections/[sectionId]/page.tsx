"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Plus, Calendar, X, Search, Edit, Save, Trash2, Package, RefreshCw } from "lucide-react";

const units = ["pièce", "kg", "litre", "boîte", "paquet", "sac", "bouteille"];

export default function SectionDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams();
  const sectionId = params.sectionId as string;

  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState([]);
  const [totalStock, setTotalStock] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", unit: "pièce" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [closing, setClosing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sellQuantities, setSellQuantities] = useState({});
  const [stockQuantities, setStockQuantities] = useState({}); // pour les mises à jour de stock

  const today = new Date();
  const formattedDate = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  useEffect(() => {
    if (session?.user?.role === "admin") {
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
      setTotalStock(data.totalStock || 0);
      setTotalSold(data.totalSold || 0);
      const initialSell = {};
      const initialStock = {};
      data.products.forEach(p => {
        initialSell[p.id] = 0;
        initialStock[p.id] = p.quantity || 0;
      });
      setSellQuantities(initialSell);
      setStockQuantities(initialStock);
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

  const updateStock = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) {
      toast.error("La quantité ne peut pas être négative");
      return;
    }
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity: newQuantity }),
    });
    if (res.ok) {
      toast.success("Stock mis à jour");
      setStockQuantities(prev => ({ ...prev, [productId]: 0 }));
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const sellProduct = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      toast.error("Quantité de vente invalide");
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product || product.quantity < quantity) {
      toast.error("Stock insuffisant");
      return;
    }
    const res = await fetch(`/api/admin/sections/${sectionId}/sales`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    if (res.ok) {
      toast.success(`Vente de ${quantity} enregistrée`);
      setSellQuantities(prev => ({ ...prev, [productId]: 0 }));
      fetchData();
    } else {
      toast.error("Erreur lors de la vente");
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
      setNewProduct({ name: "", price: "", unit: "pièce" });
      fetchData();
    } else {
      toast.error("Erreur");
    }
  };

  const editProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const res = await fetch(`/api/admin/sections/${sectionId}/products`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: editingProduct.id,
        name: editingProduct.name,
        price: editingProduct.price,
        unit: editingProduct.unit,
      }),
    });
    if (res.ok) {
      toast.success("Produit modifié");
      setEditingProduct(null);
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
    const res = await fetch(`/api/admin/sections/${sectionId}/close`, { method: "POST" });
    if (res.ok) {
      toast.success("Journée clôturée ! Rapport envoyé par email.");
      fetchData();
    } else {
      toast.error("Erreur lors de la clôture");
    }
    setClosing(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!session || session.user.role !== "admin") {
    return <div className="p-6 text-center text-red-500">Accès refusé</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="p-6 max-w-md mx-auto mt-20">
        <h1 className="text-2xl font-bold mb-4">🔒 Accès section</h1>
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ventes du jour</h1>
          <p className="text-sm text-gray-500">{formattedDate}</p>
          <div className="flex flex-wrap gap-4 mt-1">
            <p className="text-sm">Stock total : <span className="font-bold text-blue-600">{totalStock.toFixed(2)} $</span></p>
            <p className="text-sm">Vendu aujourd'hui : <span className="font-bold text-green-600">{totalSold.toFixed(2)} $</span></p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowProductForm(!showProductForm)}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Produit
          </button>
          <button
            onClick={closeDay}
            disabled={closing}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <Calendar size={18} /> {closing ? "Clôture..." : "Clôturer"}
          </button>
        </div>
      </div>

      {/* Recherche */}
      <div className="relative mb-4 max-w-sm">
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {/* Formulaire d'ajout */}
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
          <div className="w-32">
            <label className="block text-sm font-medium">Unité</label>
            <select
              value={newProduct.unit}
              onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
              className="input-field"
            >
              {units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary">Ajouter</button>
          <button type="button" onClick={() => setShowProductForm(false)} className="btn-secondary">Annuler</button>
        </form>
      )}

      {/* Formulaire d'édition */}
      {editingProduct && (
        <form onSubmit={editProduct} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 border-2 border-blue-500">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Modifier le produit</h3>
            <button type="button" onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-red-500">
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[150px]">
              <label className="block text-sm font-medium">Nom</label>
              <input
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium">Prix ($)</label>
              <input
                type="number"
                step="0.01"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                className="input-field"
                required
              />
            </div>
            <div className="w-32">
              <label className="block text-sm font-medium">Unité</label>
              <select
                value={editingProduct.unit || "pièce"}
                onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                className="input-field"
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save size={18} /> Enregistrer
            </button>
          </div>
        </form>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Produit</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Prix</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Total stock</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Vendre</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => {
                const stock = product.quantity;
                const stockValue = stock * product.price;
                const isOutOfStock = stock === 0;
                return (
                  <tr key={product.id}>
                    <td className="px-3 py-2 font-medium">{product.name}</td>
                    <td className="px-3 py-2">{product.price.toFixed(2)} $ / {product.unit || "pièce"}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockQuantities[product.id] !== undefined ? stockQuantities[product.id] : stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setStockQuantities(prev => ({ ...prev, [product.id]: val }));
                          }}
                          className="input-field w-20 py-1 text-sm"
                        />
                        <button
                          onClick={() => updateStock(product.id, stockQuantities[product.id] !== undefined ? stockQuantities[product.id] : stock)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <RefreshCw size={14} /> Mettre à jour
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-bold">{stockValue.toFixed(2)} $</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          max={stock}
                          value={sellQuantities[product.id] || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setSellQuantities(prev => ({ ...prev, [product.id]: val }));
                          }}
                          className="input-field w-16 py-1 text-sm"
                          disabled={isOutOfStock}
                        />
                        <button
                          onClick={() => sellProduct(product.id, sellQuantities[product.id] || 1)}
                          disabled={isOutOfStock}
                          className={`px-2 py-1 rounded text-sm flex items-center gap-1 ${
                            isOutOfStock
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          <Package size={14} /> Vendre
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2 flex gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-500 hover:text-blue-700 p-1"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-gray-50 dark:bg-gray-700 font-bold">
                <td colSpan={3} className="px-3 py-2 text-right">TOTAUX</td>
                <td className="px-3 py-2 text-lg text-blue-600">{totalStock.toFixed(2)} $</td>
                <td className="px-3 py-2 text-lg text-green-600">{totalSold.toFixed(2)} $</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Version mobile : cartes */}
      <div className="md:hidden mt-6 grid grid-cols-1 gap-4">
        {filteredProducts.map((product) => {
          const stock = product.quantity;
          const isOutOfStock = stock === 0;
          const stockValue = stock * product.price;
          return (
            <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">{product.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setEditingProduct(product)} className="text-blue-500"><Edit size={16} /></button>
                  <button onClick={() => deleteProduct(product.id)} className="text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div><span className="text-gray-500">Prix :</span> {product.price.toFixed(2)} $ / {product.unit || "pièce"}</div>
                <div>
                  <span className="text-gray-500">Stock :</span>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      min="0"
                      value={stockQuantities[product.id] !== undefined ? stockQuantities[product.id] : stock}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setStockQuantities(prev => ({ ...prev, [product.id]: val }));
                      }}
                      className="input-field w-16 py-0 text-sm inline-block"
                    />
                    <button
                      onClick={() => updateStock(product.id, stockQuantities[product.id] !== undefined ? stockQuantities[product.id] : stock)}
                      className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs"
                    >
                      MAJ
                    </button>
                  </div>
                </div>
                <div><span className="text-gray-500">Total stock :</span> {stockValue.toFixed(2)} $</div>
                <div>
                  <span className="text-gray-500">Vendre :</span>
                  <div className="flex items-center gap-1 mt-1">
                    <input
                      type="number"
                      min="1"
                      max={stock}
                      value={sellQuantities[product.id] || 0}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setSellQuantities(prev => ({ ...prev, [product.id]: val }));
                      }}
                      className="input-field w-16 py-0 text-sm"
                      disabled={isOutOfStock}
                    />
                    <button
                      onClick={() => sellProduct(product.id, sellQuantities[product.id] || 1)}
                      disabled={isOutOfStock}
                      className={`px-2 py-0.5 rounded text-xs flex items-center gap-1 ${
                        isOutOfStock
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      <Package size={14} /> Vendre
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}