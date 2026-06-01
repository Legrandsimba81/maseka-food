import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}