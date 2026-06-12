import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: params.slug },
      include: {
        comments: { orderBy: { createdAt: "desc" } },
        author: { select: { name: true } },
      },
    });
    if (!article) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
    // Incrémenter les vues
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });
    return NextResponse.json(article);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const data = await req.json();
    const { title, content, excerpt, imageMain, imagesSecondary } = data;
    let newSlug = params.slug;
    if (title) {
      newSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    }
    const updated = await prisma.article.update({
      where: { slug: params.slug },
      data: {
        title,
        slug: newSlug !== params.slug ? newSlug : undefined,
        content,
        excerpt,
        imageMain: imageMain === "" ? null : imageMain,
        imagesSecondary: imagesSecondary || [],
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await prisma.article.delete({ where: { slug: params.slug } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}