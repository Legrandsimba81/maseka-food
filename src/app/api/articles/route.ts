import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const slug = decodeURIComponent(params.slug);
    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        author: { select: { name: true } },
      },
    });
    if (!article) {
      return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    }

    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("Erreur GET article public:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}