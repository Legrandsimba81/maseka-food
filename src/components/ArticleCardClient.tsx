"use client";
import Link from "next/link";
import { Calendar, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react";

export default function ArticleCardClient({ article }: { article: any }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: article.title, url: `/articles/${article.slug}` });
    } else {
      navigator.clipboard.writeText(`/articles/${article.slug}`);
      alert("Lien copié !");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      {article.imageMain ? (
        <img src={article.imageMain} alt={article.title} className="w-full h-48 object-cover" />
      ) : (
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          Aucune image
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{article.title}</h3>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Heart size={14} /> {article.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle size={14} /> {article._count.comments}
          </span>
          <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary">
            <Share2 size={14} /> Partager
          </button>
          <Link href={`/articles/${article.slug}`} className="flex items-center gap-1 text-primary hover:underline ml-auto">
            Lire <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}