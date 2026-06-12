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

  // Incrémentation des vues côté serveur
  await prisma.article.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return <ArticleClient article={article} />;
}