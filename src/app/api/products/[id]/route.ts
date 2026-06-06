import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
    // Prix effectif : promo si active, sinon prix normal
    const effectivePrice = product.isPromo && product.promoPrice ? product.promoPrice : product.price;
    return NextResponse.json({ ...product, effectivePrice });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}