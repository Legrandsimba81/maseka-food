"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploadWithCrop from "@/components/ImageUploadWithCrop";
import Editor from "@/components/Editor";

export default function EditArticlePage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageMain, setImageMain] = useState("");
  const [imagesSecondary, setImagesSecondary] = useState<string[]>([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/articles/${params.slug}`);
        if (!res.ok) throw new Error("Article non trouvé");
        const data = await res.json();
        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setContent(data.content || "");
        setImageMain(data.imageMain || "");
        setImagesSecondary(Array.isArray(data.imagesSecondary) ? data.imagesSecondary : []);
      } catch (err) {
        toast.error("Erreur chargement article");
        router.push("/admin/articles");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [params.slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Le titre et le contenu sont requis");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/articles/${params.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt: excerpt.trim(),
          content,
          imageMain,
          imagesSecondary,
        }),
      });
      if (res.ok) {
        toast.success("Article modifié !");
        router.push("/admin/articles");
      } else {
        const err = await res.json();
        toast.error(err.error || "Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">✏️ Modifier l'article</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">Titre *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Résumé (excerpt)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} className="input-field" rows={2} placeholder="Bref résumé" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image principale (paysage)</label>
          <ImageUploadWithCrop onUpload={setImageMain} onRemove={() => setImageMain("")} currentImage={imageMain} aspect={16 / 9} label="Image principale" />
          <p className="text-xs text-gray-500 mt-1">Format paysage (16:9).</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Images secondaires (portrait)</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-2">
            {imagesSecondary.map((url, idx) => (
              <div key={idx} className="relative group">
                <img src={url} alt={`Secondaire ${idx + 1}`} className="w-full h-48 object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => setImagesSecondary(imagesSecondary.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-70 hover:opacity-100"
                >
                  ✕
                </button>
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
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  );
}