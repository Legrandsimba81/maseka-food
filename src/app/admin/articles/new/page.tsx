"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageMain, setImageMain] = useState("");
  const [imagesSecondary, setImagesSecondary] = useState<string[]>([]);
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
        imagesSecondary,
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
          <ImageUpload
            label="Image principale"
            onUpload={(url) => setImageMain(url)}
            onRemove={() => setImageMain("")}
            currentImage={imageMain}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Images secondaires</label>
          <div className="space-y-2">
            {imagesSecondary.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <img src={url} alt="" className="h-12 w-auto rounded" />
                <button
                  type="button"
                  onClick={() => setImagesSecondary(imagesSecondary.filter((_, i) => i !== idx))}
                  className="text-red-500"
                >
                  Supprimer
                </button>
              </div>
            ))}
            <ImageUpload
              label="Ajouter une image"
              onUpload={(url) => setImagesSecondary([...imagesSecondary, url])}
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary">Publier</button>
      </form>
    </div>
  );
}