import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT : mise à jour d'un produit (admin uniquement)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, price, category, imageUrl, isAvailable } = body;

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    });
    if (!existingProduct) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Mise à jour
    const updated = await prisma.product.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        imageUrl,
        isAvailable,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur mise à jour produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// Optionnel : DELETE pour supprimer un produit
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}