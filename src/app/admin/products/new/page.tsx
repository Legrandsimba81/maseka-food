"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";

const categories = [
  "pains",
  "viennoiseries",
  "pâtisseries",
  "sandwichs",
  "pizzas",
  "burgers",
  "snacks",
  "boissons",
];

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
      }),
    });
    if (res.ok) {
      toast.success("Produit créé");
      router.push("/admin/products");
    } else {
      toast.error("Erreur lors de la création");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-500 hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Nouveau produit</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Prix ($)</label>
          <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Catégorie</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Sélectionner</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image du produit</label>
          <ImageUploadWithCrop
            onUpload={(url) => setForm({ ...form, imageUrl: url })}
            onRemove={() => setForm({ ...form, imageUrl: "" })}
            currentImage={form.imageUrl}
            aspect={1 / 1} // carré pour les produits (vous pouvez ajuster)
            label="Télécharger une image"
          />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
          <label className="text-sm">Disponible</label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? "Création..." : "Créer"}</button>
      </form>
    </div>
  );
}