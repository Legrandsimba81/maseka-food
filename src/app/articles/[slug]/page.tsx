import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleClient from "./ArticleClient";

export default async function ArticlePage({ params }: { params: { slug: string } }) {
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