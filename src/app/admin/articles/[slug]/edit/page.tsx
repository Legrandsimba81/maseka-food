"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageMain, setImageMain] = useState("");
  const [imagesSecondary, setImagesSecondary] = useState<string[]>([]);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/articles/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article non trouvé");
        return res.json();
      })
      .then((data) => {
        setTitle(data.title);
        setContent(data.content);
        setImageMain(data.imageMain || "");
        setImagesSecondary(Array.isArray(data.imagesSecondary) ? data.imagesSecondary : []);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.message);
        router.push("/admin/articles");
      });
  }, [slug, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          imageMain,
          imagesSecondary,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Article modifié");
        router.push("/admin/articles");
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/articles" className="text-gray-500 hover:text-primary">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Modifier l'article</h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
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
        <button type="submit" disabled={saving} className="btn-primary w-full">Enregistrer</button>
      </form>
    </div>
  );
}