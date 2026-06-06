"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    imageUrl: "",
    isAvailable: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Produit introuvable");
        return res.json();
      })
      .then(data => {
        setForm({
          name: data.name,
          description: data.description || "",
          price: data.price.toString(),
          category: data.category,
          imageUrl: data.imageUrl || "",
          isAvailable: data.isAvailable,
        });
        setLoading(false);
      })
      .catch(err => {
        toast.error(err.message);
        router.push("/admin/products");
      });
  }, [id, router]);

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
    setSaving(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
      }),
    });
    if (res.ok) {
      toast.success("Produit modifié");
      router.push("/admin/products");
    } else {
      toast.error("Erreur lors de la modification");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/products" className="text-gray-500 hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Modifier le produit</h1>
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
          <label className="block text-sm font-medium mb-1">URL de l’image</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input-field" placeholder="/images/produits/..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
          <label className="text-sm">Disponible</label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? "Enregistrement..." : "Enregistrer"}</button>
      </form>
    </div>
  );
}