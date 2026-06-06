"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { formatPrice } from "@/lib/format";

export default function AdminPromotionsPage() {
  const { data: session } = useSession();
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [promoPrice, setPromoPrice] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchProducts = async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setAllProducts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...allProducts];
    if (categoryFilter !== "all") {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (statusFilter === "promo") {
      filtered = filtered.filter(p => p.isPromo);
    } else if (statusFilter === "non_promo") {
      filtered = filtered.filter(p => !p.isPromo);
    }
    setFilteredProducts(filtered);
  }, [categoryFilter, statusFilter, allProducts]);

  const togglePromo = async (productId, currentStatus) => {
    if (!currentStatus && (!promoPrice || parseFloat(promoPrice) <= 0)) {
      toast.error("Veuillez entrer un prix promotionnel valide");
      return;
    }
    const res = await fetch("/api/admin/promotions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        isPromo: !currentStatus,
        promoPrice: !currentStatus ? parseFloat(promoPrice) : null,
      }),
    });
    if (res.ok) {
      toast.success(currentStatus ? "Promotion retirée" : "Produit en promotion");
      setEditingId(null);
      setPromoPrice("");
      fetchProducts();
    } else toast.error("Erreur");
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;
  if (loading) return <div>Chargement...</div>;

  const categories = [...new Set(allProducts.map(p => p.category))];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des promotions</h1>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">Tous les produits</option>
          <option value="promo">En promotion</option>
          <option value="non_promo">Non promus</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
                <p className="text-amber-600 font-bold">{formatPrice(product.price)} $</p>
                {product.isPromo && product.promoPrice && (
                  <p className="text-green-600 text-sm">Prix promo : {formatPrice(product.promoPrice)} $</p>
                )}
              </div>
              {product.isPromo ? (
                <button
                  onClick={() => togglePromo(product.id, true)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Retirer promo
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {editingId === product.id ? (
                    <>
                      <input
                        type="number"
                        step="0.01"
                        value={promoPrice}
                        onChange={(e) => setPromoPrice(e.target.value)}
                        placeholder="Prix promo"
                        className="input-field text-sm w-32"
                      />
                      <button onClick={() => togglePromo(product.id, false)} className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Valider
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-gray-500 text-sm">Annuler</button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingId(product.id)}
                      className="bg-amber-500 text-white px-3 py-1 rounded text-sm"
                    >
                      Mettre en promo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}