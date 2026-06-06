import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { productId, isPromo, promoPrice } = await req.json();
  const updated = await prisma.product.update({
    where: { id: productId },
    data: { isPromo, promoPrice: promoPrice || null },
  });
  return NextResponse.json(updated);
}