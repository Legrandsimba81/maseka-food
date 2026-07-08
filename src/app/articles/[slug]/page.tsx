import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClient from "./ArticleClient";
import { Metadata } from "next";

type Props = {
  params: { slug: string };
};

// Génération des métadonnées dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      imageMain: true,
      content: true,
      updatedAt: true,
    },
  });
  if (!article) {
    return {
      title: "Article non trouvé",
    };
  }

  const description = article.excerpt || article.content?.slice(0, 160) || "Lire cet article sur Maseka Food";
  const imageUrl = article.imageMain || "/images/hero-bakery.jpg";
  const url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://maseka-food.vercel.app'}/articles/${params.slug}`;

  return {
    title: `${article.title} | Maseka Food`,
    description,
    openGraph: {
      title: article.title,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: article.title }],
      url,
      type: "article",
      publishedTime: article.updatedAt?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      comments: { orderBy: { createdAt: "desc" } },
      author: { select: { name: true } },
    },
  });
  if (!article) return notFound();

  // Incrémentation des vues
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  // Récupération des articles similaires (4 derniers, hors article courant)
  const similarArticles = await prisma.article.findMany({
    where: { id: { not: article.id } },
    take: 4,
    orderBy: { publishedAt: "desc" },
    include: { _count: { select: { comments: true } } },
  });

  return <ArticleClient article={article} similarArticles={similarArticles} />;
}