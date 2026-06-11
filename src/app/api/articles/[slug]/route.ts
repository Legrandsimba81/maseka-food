import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: { comments: { orderBy: { createdAt: "desc" } }, author: { select: { name: true } } },
    });
    if (!article) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    // Incrémenter les vues
    await prisma.article.update({ where: { id: article.id }, data: { views: { increment: 1 } } });
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}