// app/api/admin/articles/[slug]/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

// GET – Récupérer un article (admin, sans incrémenter les vues)
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
    return NextResponse.json(article);
  } catch (error) {
    console.error("Erreur GET article admin:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT – Modifier un article
export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, excerpt, imageMain, imagesSecondary } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    let newSlug = params.slug;
    if (title) {
      newSlug = slugify(title, { lower: true, strict: true, locale: "fr" });
    }

    // Vérifier si le nouveau slug est différent et n'est pas déjà pris
    if (newSlug !== params.slug) {
      const existing = await prisma.article.findUnique({ where: { slug: newSlug } });
      if (existing) {
        return NextResponse.json({ error: "Un article avec ce titre existe déjà" }, { status: 409 });
      }
    }

    const imagesSecondaryArray = Array.isArray(imagesSecondary) ? imagesSecondary : [];

    const updated = await prisma.article.update({
      where: { slug: params.slug },
      data: {
        title,
        slug: newSlug,
        content,
        excerpt: excerpt || content.slice(0, 160),
        imageMain: imageMain || null,
        imagesSecondary: imagesSecondaryArray,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erreur PUT article:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE – Supprimer un article
export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Supprimer les commentaires
    await prisma.comment.deleteMany({
      where: { article: { slug: params.slug } },
    });
    // Supprimer l'article
    await prisma.article.delete({
      where: { slug: params.slug },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE article:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}