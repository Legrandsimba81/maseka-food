"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name,
          description: data.description,
          price: data.price.toString(),
          category: data.category,
          imageUrl: data.imageUrl || "",
          isAvailable: data.isAvailable,
        });
      })
      .catch(() => toast.error("Erreur chargement"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
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
      toast.error("Erreur");
    }
    setLoading(false);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm({ ...form, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Modifier le produit</h1>
        <Link href="/admin/products" className="btn-secondary text-sm">Annuler</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom</label>
          <input name="name" value={form.name} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea name="description" rows={3} value={form.description} onChange={handleChange} className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Prix ($)</label>
          <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} required className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium">Catégorie</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Sélectionner</option>
            <option value="pains">Pains</option>
            <option value="viennoiseries">Viennoiseries</option>
            <option value="pâtisseries">Pâtisseries</option>
            <option value="sandwichs">Sandwichs</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium">URL de l’image</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className="input-field" placeholder="/images/produits/monproduit.jpg" />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" name="isAvailable" checked={form.isAvailable} onChange={handleChange} />
          <label>Disponible</label>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}