import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = parseInt(searchParams.get("skip") || "0");
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sort") || "publishedAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";

  const where = search ? {
    OR: [
      { title: { contains: search, mode: "insensitive" as const } },
      { content: { contains: search, mode: "insensitive" as const } },
    ],
  } : {};

  const articles = await prisma.article.findMany({
    where,
    orderBy: { [sortBy]: order },
    skip,
    take: limit,
    include: {
      _count: { select: { comments: true } },
      author: { select: { name: true } },
    },
  });

  const total = await prisma.article.count({ where });

  return NextResponse.json({ articles, total });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await req.json();
  const { title, content, excerpt, imageMain, imagesSecondary } = data;
  if (!title || !content) {
    return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
  }
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const existing = await prisma.article.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "Un article avec ce titre existe déjà" }, { status: 409 });
  }
  const author = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!author) return NextResponse.json({ error: "Auteur non trouvé" }, { status: 404 });
  const article = await prisma.article.create({
    data: {
      title,
      slug,
      content,
      excerpt: excerpt || content.slice(0, 160),
      imageMain,
      imagesSecondary: imagesSecondary || [],
      authorId: author.id,
    },
  });
  return NextResponse.json(article, { status: 201 });
}