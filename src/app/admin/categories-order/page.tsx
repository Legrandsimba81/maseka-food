"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { GripVertical } from "lucide-react";

const allCategories = ["pains", "viennoiseries", "pâtisseries", "sandwichs", "pizzas", "burgers", "snacks", "boissons"];

export default function CategoriesOrderPage() {
  const { data: session } = useSession();
  const [order, setOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(settings => {
        if (settings?.categoryOrder && Array.isArray(settings.categoryOrder)) {
          setOrder(settings.categoryOrder);
        } else {
          setOrder(allCategories);
        }
        setLoading(false);
      });
  }, []);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...order];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setOrder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === order.length - 1) return;
    const newOrder = [...order];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    setOrder(newOrder);
  };

  const saveOrder = async () => {
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryOrder: order }),
    });
    if (res.ok) {
      toast.success("Ordre des catégories sauvegardé");
    } else {
      toast.error("Erreur");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;
  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Ordre d’affichage des catégories</h1>
      <div className="space-y-2">
        {order.map((cat, idx) => (
          <div key={cat} className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <GripVertical className="text-gray-400" size={20} />
            <span className="flex-1 capitalize">{cat}</span>
            <button onClick={() => moveUp(idx)} className="px-2 py-1 border rounded" disabled={idx === 0}>↑</button>
            <button onClick={() => moveDown(idx)} className="px-2 py-1 border rounded" disabled={idx === order.length - 1}>↓</button>
          </div>
        ))}
      </div>
      <button onClick={saveOrder} className="btn-primary mt-6">Enregistrer l’ordre</button>
    </div>
  );
}