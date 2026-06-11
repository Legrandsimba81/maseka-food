"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageMain, setImageMain] = useState("");
  const [imagesSecondary, setImagesSecondary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        imageMain,
        imagesSecondary: imagesSecondary.split(",").map(s => s.trim()).filter(Boolean),
      }),
    });
    if (res.ok) {
      toast.success("Article créé");
      router.push("/admin/articles");
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Nouvel article</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Titre</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium">Contenu (HTML)</label>
          <textarea rows={10} value={content} onChange={(e) => setContent(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium">URL image principale</label>
          <input value={imageMain} onChange={(e) => setImageMain(e.target.value)} className="input-field" placeholder="https://..." />
        </div>
        <div>
          <label className="block text-sm font-medium">URL images secondaires (séparées par des virgules)</label>
          <input value={imagesSecondary} onChange={(e) => setImagesSecondary(e.target.value)} className="input-field" placeholder="https://..., https://..." />
        </div>
        <button type="submit" disabled={loading} className="btn-primary">Publier</button>
      </form>
    </div>
  );
}