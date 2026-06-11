import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: { slug: string } }) {
  const article = await prisma.article.findUnique({ where: { slug: params.slug } });
  if (!article) return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
  const updated = await prisma.article.update({
    where: { id: article.id },
    data: { likes: { increment: 1 } },
  });
  return NextResponse.json({ likes: updated.likes });
}