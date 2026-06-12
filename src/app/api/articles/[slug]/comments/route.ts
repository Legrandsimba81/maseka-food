import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  try {
    const { authorName, content } = await req.json();
    if (!authorName || !content) {
      return NextResponse.json({ error: "Nom et contenu requis" }, { status: 400 });
    }
    const article = await prisma.article.findUnique({ where: { slug: params.slug } });
    if (!article) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    const comment = await prisma.comment.create({
      data: {
        authorName,
        content,
        articleId: article.id,
      },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}