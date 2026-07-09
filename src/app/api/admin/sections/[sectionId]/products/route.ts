import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET – Liste des produits d'une section (avec vérification du mot de passe)
export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Vérifier que la section existe
  const section = await prisma.section.findUnique({
    where: { id: params.sectionId },
  });
  if (!section) {
    return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
  }

  const products = await prisma.sectionProduct.findMany({
    where: { sectionId: params.sectionId },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(products);
}

// POST – Ajouter un produit à la section
export async function POST(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, price } = await req.json();
    if (!name || !price) {
      return NextResponse.json({ error: "Nom et prix requis" }, { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const product = await prisma.sectionProduct.create({
      data: {
        sectionId: params.sectionId,
        name,
        price: parseFloat(price),
        quantity: 0,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur ajout produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT – Modifier un produit
export async function PUT(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId, name, price } = await req.json();
    if (!productId || !name || !price) {
      return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
    }

    const product = await prisma.sectionProduct.update({
      where: { id: productId },
      data: { name, price: parseFloat(price) },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Erreur modification produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE – Supprimer un produit
export async function DELETE(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "ID produit requis" }, { status: 400 });
    }

    await prisma.sectionProduct.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}