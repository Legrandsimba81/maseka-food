import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const articles = await prisma.article.findMany();
  for (const article of articles) {
    const newSlug = slugify(article.title, { lower: true, strict: true, locale: "fr" });
    if (newSlug !== article.slug) {
      const existing = await prisma.article.findUnique({ where: { slug: newSlug } });
      if (existing && existing.id !== article.id) {
        const uniqueSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        await prisma.article.update({ where: { id: article.id }, data: { slug: uniqueSlug } });
      } else {
        await prisma.article.update({ where: { id: article.id }, data: { slug: newSlug } });
      }
    }
  }
  return NextResponse.json({ success: true, message: "Slugs corrigés" });
}