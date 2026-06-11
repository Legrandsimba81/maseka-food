import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Calendar, Eye, Heart, Share2 } from "lucide-react";
import LikeButton from "@/components/LikeButton";
import CommentsSection from "@/components/CommentsSection";

// Force le rendu dynamique (pas de pré-rendu statique pour les articles)
export const dynamic = 'force-dynamic';

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        author: { select: { name: true } },
      },
    });

    if (!article) {
      return notFound();
    }

    // Incrémenter les vues (asynchrone, ne pas attendre pour éviter de bloquer)
    prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    }).catch(err => console.error("Erreur incrément views:", err));

    // S'assurer que imagesSecondary est un tableau de chaînes
    const imagesSecondary = Array.isArray(article.imagesSecondary)
      ? article.imagesSecondary.filter((img): img is string => typeof img === "string")
      : [];

    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {article.imageMain && (
          <div className="relative w-full h-96 mb-8 rounded-xl overflow-hidden">
            <img src={article.imageMain} alt={article.title} className="object-cover w-full h-full" />
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
        <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-6">
          <span className="flex items-center gap-1">
            <Calendar size={16} /> {new Date(article.publishedAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={16} /> {article.views} vues
          </span>
          <span className="flex items-center gap-1">
            <Heart size={16} /> {article.likes} likes
          </span>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: article.title, url: window.location.href });
              }
            }}
            className="flex items-center gap-1 hover:text-primary"
          >
            <Share2 size={16} /> Partager
          </button>
        </div>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        {imagesSecondary.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            {imagesSecondary.map((img, idx) => (
              <img key={idx} src={img} alt={`Illustration ${idx + 1}`} className="rounded-lg shadow-md" />
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
    console.error("Erreur lors du chargement de l'article:", error);
    // En cas d'erreur, afficher une page d'erreur
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Erreur</h1>
        <p className="mt-2">Une erreur est survenue lors du chargement de l'article.</p>
        <Link href="/articles" className="btn-primary mt-4 inline-block">Retour aux articles</Link>
      </div>
    );
  }
}