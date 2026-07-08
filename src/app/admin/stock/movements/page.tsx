"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowDownCircle, ArrowUpCircle, History } from "lucide-react";

interface StockProduct {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unit: string;
}

interface StockMovement {
  id: string;
  productId: string;
  type: "entree" | "sortie";
  quantity: number;
  reason: string | null;
  createdAt: string;
  product: StockProduct;
}

export default function StockMovementsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("productId");

  const [products, setProducts] = useState<StockProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(productIdParam || "");
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Formulaire mouvement
  const [movementType, setMovementType] = useState<"entree" | "sortie">("sortie");
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  // Récupérer les produits
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch("/api/admin/stock?limit=100");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        if (!productIdParam && data.length > 0) {
          setSelectedProductId(data[0].id);
        }
      }
    };
    fetchProducts();
  }, [productIdParam]);

  // Récupérer les mouvements du produit sélectionné
  useEffect(() => {
    if (!selectedProductId) return;
    setLoading(true);
    fetch(`/api/admin/stock/movements?productId=${selectedProductId}`)
      .then(res => res.json())
      .then(data => {
        setMovements(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Erreur chargement historique");
        setLoading(false);
      });
  }, [selectedProductId]);

  // Enregistrer un mouvement
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error("Sélectionnez un produit");
      return;
    }
    if (quantity <= 0) {
      toast.error("La quantité doit être positive");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/admin/stock/movement", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: selectedProductId,
        type: movementType,
        quantity,
        reason: reason || undefined,
      }),
    });
    if (res.ok) {
      toast.success("Mouvement enregistré");
      setQuantity(1);
      setReason("");
      // Recharger les mouvements et mettre à jour la liste des produits
      const movementsRes = await fetch(`/api/admin/stock/movements?productId=${selectedProductId}`);
      if (movementsRes.ok) {
        const data = await movementsRes.json();
        setMovements(data);
      }
      // Mettre à jour la liste des produits pour les quantités
      const productsRes = await fetch("/api/admin/stock?limit=100");
      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data);
      }
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
    setSaving(false);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Gestion des mouvements de stock</h1>

      {/* Sélecteur produit */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium mb-1">Produit</label>
        <select
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className="input-field w-full max-w-md"
        >
          <option value="">Choisir un produit</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.sku} - {p.name} ({p.quantity} {p.unit})
            </option>
          ))}
        </select>
      </div>

      {selectedProductId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulaire de mouvement */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {movementType === "entree" ? "Ajouter au stock" : "Retirer du stock"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <div className="flex gap-4 mt-1">
                  <button
                    type="button"
                    onClick={() => setMovementType("sortie")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      movementType === "sortie"
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <ArrowUpCircle size={18} /> Sortie
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType("entree")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      movementType === "entree"
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600"
                        : "border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    <ArrowDownCircle size={18} /> Entrée
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Quantité</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="input-field"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Stock actuel : {selectedProduct?.quantity || 0} {selectedProduct?.unit}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Raison (optionnelle)</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field"
                  placeholder="Ex: Vente client, Casse, Réapprovisionnement"
                />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? "Enregistrement..." : "Enregistrer le mouvement"}
              </button>
            </form>
          </div>

          {/* Historique des mouvements */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History size={20} /> Historique
            </h2>
            {loading ? (
              <p>Chargement...</p>
            ) : movements.length === 0 ? (
              <p className="text-gray-500">Aucun mouvement pour ce produit.</p>
            ) : (
              <div className="overflow-y-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Qté</th>
                      <th className="px-3 py-2 text-left">Raison</th>
                      <th className="px-3 py-2 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m) => (
                      <tr key={m.id} className="border-b dark:border-gray-700">
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            m.type === "entree" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {m.type === "entree" ? "+" : "-"}
                          </span>
                        </td>
                        <td className="px-3 py-2">{m.quantity}</td>
                        <td className="px-3 py-2">{m.reason || "-"}</td>
                        <td className="px-3 py-2 text-xs">{new Date(m.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}