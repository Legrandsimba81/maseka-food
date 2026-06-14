// src/components/LatestArticlesGrid.tsx
"use client";
import Link from "next/link";
import { Calendar, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react";

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  imageMain: string | null;
  publishedAt: Date;
  likes: number;
  _count: { comments: number };
}

export default function LatestArticlesGrid({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {articles.map((article) => (
        <div key={article.id} className="bg-white dark:bg-gray-800 rounded-lg border-2 overflow-hidden">
          {article.imageMain && (
            <img src={article.imageMain} alt={article.title} className="w-full h-48 object-cover" />
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
              {article.excerpt || article.content?.replace(/<[^>]*>/g, '').slice(0, 120) + '...'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1"><Heart size={14} /> {article.likes}</span>
              <span className="flex items-center gap-1"><MessageCircle size={14} /> {article._count.comments}</span>
              <button
                onClick={() => navigator.share?.({ title: article.title, url: `/articles/${article.slug}` })}
                className="flex items-center gap-1 hover:text-primary"
              >
                <Share2 size={14} /> Partager
              </button>
              <Link href={`/articles/${article.slug}`} className="flex items-center gap-1 text-primary hover:underline ml-auto">
                Lire l'article... <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}