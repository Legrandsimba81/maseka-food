"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "", imageUrl: "", isAvailable: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${id}`).then(res => res.json()).then(data => setForm({ ...data, price: data.price.toString() }));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/admin/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: parseFloat(form.price) }),
    });
    if (res.ok) router.push("/admin/products");
    else alert("Erreur");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Modifier le produit</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input-field" placeholder="Nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <textarea className="input-field" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input className="input-field" type="number" step="0.01" placeholder="Prix" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
        <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} required>
          <option value="">Catégorie</option>
          <option value="pains">Pains</option>
          <option value="viennoiseries">Viennoiseries</option>
          <option value="pâtisseries">Pâtisseries</option>
        </select>
        <input className="input-field" placeholder="URL image" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.isAvailable} onChange={e => setForm({ ...form, isAvailable: e.target.checked })} />
          Disponible
        </label>
        <button type="submit" disabled={loading} className="btn-primary">Enregistrer</button>
      </form>
    </div>
  );
}