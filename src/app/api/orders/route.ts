import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  try {
    let { items, totalAmount, deliveryAddress, deliveryTime } = await req.json();
    if (!items || items.length === 0) return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    const productIds = items.map(i => i.productId);
    const existing = await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true } });
    const validIds = new Set(existing.map(p => p.id));
    const validItems = items.filter(i => validIds.has(i.productId));
    if (validItems.length === 0) return NextResponse.json({ error: "Aucun produit valide" }, { status: 400 });
    const recomputedTotal = validItems.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        totalAmount: recomputedTotal,
        status: "pending",
        deliveryAddress,
        deliveryTime,
        items: { create: validItems.map(i => ({ productId: i.productId, quantity: i.quantity, priceAtTime: i.price })) },
      },
      include: { items: { include: { product: true } } },
    });
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}