import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

  // Total du stock actuel (quantité × prix)
  const totalStock = products.reduce((sum, p) => sum + p.quantity * p.price, 0);

  // Vente du jour (pour le total vendu)
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

    if (product.quantity < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
    }

    const updated = await prisma.sectionProduct.update({
      where: { id: productId },
      data: { quantity: { decrement: quantity } },
    });

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

    await prisma.dailySaleItem.create({
      data: {
        dailySaleId: dailySale.id,
        productId: product.id,
        quantity: quantity,
        priceAtSale: product.price,
        total: product.price * quantity,
      },
    });

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