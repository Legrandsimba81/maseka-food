"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import Editor from "@/components/Editor";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageMain, setImageMain] = useState("");
  const [imagesSecondary, setImagesSecondary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Le titre et le contenu sont requis");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/articles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, excerpt: excerpt.trim(), content, imageMain, imagesSecondary }),
    });
    if (res.ok) {
      toast.success("Article créé !");
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" placeholder="Titre accrocheur" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Résumé (excerpt)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input-field" rows={2} placeholder="Bref résumé (affiché dans les listes)" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image principale (paysage)</label>
          <ImageUploadWithCrop onUpload={(url) => setImageMain(url)} onRemove={() => setImageMain("")} currentImage={imageMain} aspect={16 / 9} label="Image principale" />
          <p className="text-xs text-gray-500 mt-1">Format paysage (16:9), hauteur élevée.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images secondaires (portrait)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-2">
            {imagesSecondary.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt={`Secondaire ${idx + 1}`} className="w-full h-48 object-cover rounded-lg border" />
                <button type="button" onClick={() => setImagesSecondary(imagesSecondary.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-70 hover:opacity-100">✕</button>
              </div>
            ))}
            <div className="flex items-center justify-center border-2 border-dashed rounded-lg h-48">
              <ImageUploadWithCrop onUpload={(url) => setImagesSecondary([...imagesSecondary, url])} aspect={3 / 4} label="Ajouter" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Format portrait (3:4).</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contenu (texte enrichi) *</label>
          <Editor value={content} onChange={setContent} placeholder="Rédigez votre article..." />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">{loading ? "Publication..." : "Publier"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  );
}