import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET – Récupérer les ventes du jour
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

  // Calcul du stock total en $ (valeur du stock actuel)
  const totalStock = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dailySale = await prisma.dailySale.findFirst({
    where: {
      sectionId: params.sectionId,
      date: { gte: today, lt: tomorrow },
    },
  });

  // Total des ventes du jour (cumul des montants encaissés)
  const totalSold = dailySale?.totalAmount || 0;

  return NextResponse.json({
    products,
    totalStock,
    totalSold,
    dailySaleId: dailySale?.id || null,
    date: today,
  });
}

// POST – Vendre un produit (décrémenter le stock)
export async function POST(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId, quantity = 1 } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "ID produit requis" }, { status: 400 });
    }
    if (quantity <= 0) {
      return NextResponse.json({ error: "La quantité doit être positive" }, { status: 400 });
    }

    const product = await prisma.sectionProduct.findUnique({
      where: { id: productId },
    });
    if (!product || product.sectionId !== params.sectionId) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Vérifier le stock disponible
    if (product.quantity < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
    }

    // Décrémenter la quantité
    const updated = await prisma.sectionProduct.update({
      where: { id: productId },
      data: { quantity: { decrement: quantity } },
    });

    // Créer ou mettre à jour la vente journalière
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dailySale = await prisma.dailySale.findFirst({
      where: {
        sectionId: params.sectionId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (!dailySale) {
      dailySale = await prisma.dailySale.create({
        data: {
          sectionId: params.sectionId,
          date: today,
          totalAmount: 0,
          totalInitialStock: 0,
          totalItemsSold: 0,
        },
      });
    }

    // Ajouter la ligne de vente
    await prisma.dailySaleItem.create({
      data: {
        dailySaleId: dailySale.id,
        productId: product.id,
        quantity: quantity,
        priceAtSale: product.price,
        total: product.price * quantity,
      },
    });

    // Mettre à jour les totaux de la vente
    await prisma.dailySale.update({
      where: { id: dailySale.id },
      data: {
        totalAmount: { increment: product.price * quantity },
        totalItemsSold: { increment: quantity },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur vente:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}