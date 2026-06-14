"use client";
import Link from "next/link";
import { Calendar, Eye, Heart, MessageCircle } from "lucide-react";

export default function SimilarArticles({ articles }: { articles: any[] }) {
    if (!articles.length) return null;

    return (
        <div className="sticky top-16 pt-8 z-10 mt-8 lg:mt-0 lg:ml-8">
            <h3 className="text-xl font-semibold mb-4">Articles similaires</h3>
            <div className="space-y-4">
                {articles.map((article) => (
                    <Link key={article.id} href={`/articles/${article.slug}`} className="block group">
                        <div className="flex gap-3 items-center border-b pb-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded transition">
                            {article.imageMain && (
                                <img src={article.imageMain} alt={article.title} className="w-16 h-16 object-cover rounded" />
                            )}
                            <div className="flex-1">
                                <h4 className="font-medium line-clamp-2 group-hover:text-primary">{article.title}</h4>
                                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center gap-0.5"><Calendar size={12} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-0.5"><Eye size={12} /> {article.views}</span>
                                    <span className="flex items-center gap-0.5"><Heart size={12} /> {article.likes}</span>
                                    <span className="flex items-center gap-0.5"><MessageCircle size={12} /> {article._count.comments}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}