"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArticles = async () => {
    const res = await fetch(`/api/articles?search=${search}`);
    const data = await res.json();
    setArticles(data.articles);
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") fetchArticles();
  }, [session, search]);

  const deleteArticle = async (slug: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const res = await fetch(`/api/articles/${slug}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Article supprimé");
      fetchArticles();
    } else toast.error("Erreur");
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;
  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des articles</h1>
        <Link href="/admin/articles/new" className="btn-primary">+ Nouvel article</Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>
      {articles.length === 0 ? (
        <p>Aucun article.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-2 text-left">Titre</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Vues</th>
                <th className="px-4 py-2 text-left">Likes</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.id} className="border-b">
                  <td className="px-4 py-2">{article.title}</td>
                  <td className="px-4 py-2">{new Date(article.publishedAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{article.views}</td>
                  <td className="px-4 py-2">{article.likes}</td>
                  <td className="px-4 py-2 space-x-2">
                    <Link href={`/admin/articles/${article.slug}/edit`} className="text-blue-500 hover:underline">Modifier</Link>
                    <button onClick={() => deleteArticle(article.slug)} className="text-red-500 hover:underline">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}