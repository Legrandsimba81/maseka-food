import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";
import { Calendar, Eye, Heart, Share2 } from "lucide-react";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        author: { select: { name: true } },
      },
    });
    if (!article) return notFound();

    const imagesSecondary = Array.isArray(article.imagesSecondary) ? article.imagesSecondary : [];

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {article.imageMain && (
          <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
            <img src={article.imageMain} alt={article.title} className="object-cover w-full h-full" />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-6">
          <span className="flex items-center gap-1"><Calendar size={16} /> {new Date(article.publishedAt).toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><Eye size={16} /> {article.views} vues</span>
          <span className="flex items-center gap-1"><Heart size={16} /> {article.likes} likes</span>
          <button
            onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
            className="flex items-center gap-1 hover:text-primary"
          >
            <Share2 size={16} /> Partager
          </button>
        </div>
        <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />
        {imagesSecondary.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {imagesSecondary.map((img, idx) => (
              <img key={idx} src={img as string} alt={`Illustration ${idx + 1}`} className="rounded-lg shadow-md" />
            ))}
          </div>
        )}
        <div className="mt-8 pt-6 border-t">
          <LikeButton slug={article.slug} initialLikes={article.likes} />
          <CommentsSection slug={article.slug} initialComments={article.comments} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Erreur chargement article:", error);
    return notFound();
  }
}