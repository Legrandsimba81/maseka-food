"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        price: parseFloat(formData.price),
      }),
    });
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur lors de la création");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Nouveau produit</h1>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Prix ($)</label>
          <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Catégorie</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
            <option value="">Sélectionner</option>
            <option value="pains">Pains</option>
            <option value="viennoiseries">Viennoiseries</option>
            <option value="pâtisseries">Pâtisseries</option>
            <option value="sandwichs">Sandwichs</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">URL de l'image (optionnelle)</label>
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="input-field" placeholder="https://..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} />
          <label>Disponible</label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Création..." : "Créer le produit"}
        </button>
      </form>
    </div>
  );
}