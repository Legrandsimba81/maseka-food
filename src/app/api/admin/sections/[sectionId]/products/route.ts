import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET – Liste des produits d'une section
export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

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

// POST – Ajouter un produit
export async function POST(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, price, unit = "pièce" } = await req.json();
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
        unit,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Erreur ajout produit:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT – Modifier un produit (nom, prix, quantité, unité)
export async function PUT(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId, name, price, quantity, unit } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "ID produit requis" }, { status: 400 });
    }

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (price !== undefined) data.price = parseFloat(price);
    if (quantity !== undefined) data.quantity = parseInt(quantity);
    if (unit !== undefined) data.unit = unit;

    const product = await prisma.sectionProduct.update({
      where: { id: productId },
      data,
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