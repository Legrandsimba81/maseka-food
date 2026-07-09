"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Plus, Search, Eye, Heart, Calendar, Edit, Trash2, FileText } from "lucide-react";

export default function AdminArticlesPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchArticles = async () => {
    const res = await fetch(`/api/articles?search=${search}&limit=100`);
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
  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des articles</h1>
        <Link href="/admin/articles/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nouvel article
        </Link>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-gray-500">Aucun article pour le moment.</p>
      ) : (
        <>
          {/* Version desktop : tableau */}
          <div className="hidden md:block overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Vues</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Likes</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {articles.map(article => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-4 py-3 font-medium">{article.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye size={14} className="text-gray-400" />
                        {article.views}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart size={14} className="text-red-400" />
                        {article.likes}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link href={`/admin/articles/${article.slug}/edit`} className="text-blue-600 hover:text-blue-800 p-1" title="Modifier">
                          <Edit size={18} />
                        </Link>
                        <button onClick={() => deleteArticle(article.slug)} className="text-red-600 hover:text-red-800 p-1" title="Supprimer">
                          <Trash2 size={18} />
                        </button>
                        <Link href={`/articles/${article.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700 p-1" title="Voir">
                          <FileText size={18} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Version mobile : cartes */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {articles.map(article => (
              <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2">{article.title}</h3>
                <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {article.views} vues</span>
                  <span className="flex items-center gap-1"><Heart size={14} className="text-red-400" /> {article.likes}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/articles/${article.slug}/edit`} className="btn-secondary text-sm py-1 px-3 flex items-center gap-1">
                    <Edit size={16} /> Modifier
                  </Link>
                  <button onClick={() => deleteArticle(article.slug)} className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-lg flex items-center gap-1">
                    <Trash2 size={16} /> Supprimer
                  </button>
                  <Link href={`/articles/${article.slug}`} target="_blank" className="text-gray-500 hover:text-gray-700 p-1">
                    <FileText size={20} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}