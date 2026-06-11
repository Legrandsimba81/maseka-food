import Link from "next/link";
import { Calendar, Eye, Heart, MessageCircle } from "lucide-react";

export default function ArticleCard({ article }: { article: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
      {article.imageMain && (
        <img src={article.imageMain} alt={article.title} className="w-full h-48 object-cover" />
      )}
      <div className="p-5">
        <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">{article.excerpt}</p>
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500 gap-2">
          <div className="flex items-center gap-2">
            <Calendar size={14} /> {new Date(article.publishedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={14} /> {article.views}</span>
            <span className="flex items-center gap-1"><Heart size={14} /> {article.likes}</span>
            <span className="flex items-center gap-1"><MessageCircle size={14} /> {article._count.comments}</span>
          </div>
        </div>
        <Link href={`/articles/${article.slug}`} className="mt-4 inline-block text-primary hover:underline">
          Lire la suite →
        </Link>
      </div>
    </div>
  );
}