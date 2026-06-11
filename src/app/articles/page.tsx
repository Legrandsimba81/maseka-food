"use client";
import { useEffect, useState } from "react";
import ArticleCard from "@/components/ArticleCard";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 6;

  const fetchArticles = async (reset = false) => {
    setLoading(true);
    const res = await fetch(`/api/articles?search=${search}&skip=${reset ? 0 : skip}&limit=${limit}`);
    const data = await res.json();
    if (reset) {
      setArticles(data.articles);
      setSkip(limit);
      setHasMore(data.articles.length === limit);
    } else {
      setArticles(prev => [...prev, ...data.articles]);
      setSkip(prev => prev + limit);
      setHasMore(data.articles.length === limit);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles(true);
  }, [search]);

  const loadMore = () => fetchArticles(false);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tous nos articles</h1>
      <div className="mb-8">
        <input
          type="text"
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => <ArticleCard key={article.id} article={article} />)}
      </div>
      {loading && <p className="text-center py-8">Chargement...</p>}
      {!loading && hasMore && (
        <div className="text-center mt-8">
          <button onClick={loadMore} className="btn-primary">Charger plus</button>
        </div>
      )}
      {!loading && articles.length === 0 && <p className="text-center py-8">Aucun article trouvé.</p>}
    </div>
  );
}