"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Supprimer définitivement ce produit ?")) return;
    setLoading(true);
    const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Erreur lors de la suppression");
    }
    setLoading(false);
  };

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline">
      {loading ? "..." : "Supprimer"}
    </button>
  );
}