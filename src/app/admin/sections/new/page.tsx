"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewSectionPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !password) {
      toast.error("Nom et mot de passe requis");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, description }),
    });
    if (res.ok) {
      toast.success("Section créée !");
      router.push("/admin/sections");
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Nouvelle section</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Nom *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Mot de passe *</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" required />
          <p className="text-xs text-gray-500 mt-1">Les admins utiliseront ce mot de passe pour accéder à la section.</p>
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" rows={2} />
        </div>
        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="btn-primary">Créer</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  );
}