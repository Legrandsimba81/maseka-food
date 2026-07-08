// app/api/orders/route.ts

import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const {
      items,
      totalAmount,
      deliveryAddress,
      deliveryTime,
      orderType,
      tableNumber,
      whatsapp, // booléen indiquant si on attend une réponse simplifiée
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 });
    }

    // Validation selon le type
    if (orderType === "onSite") {
      if (!tableNumber) {
        return NextResponse.json({ error: "Numéro de table requis" }, { status: 400 });
      }
    } else {
      // delivery
      if (!deliveryAddress || !deliveryTime) {
        return NextResponse.json({ error: "Adresse et heure de livraison requises" }, { status: 400 });
      }
    }

    // Vérifier que les produits existent
    const productIds = items.map(i => i.productId);
    const existing = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true },
    });
    const validIds = new Set(existing.map(p => p.id));
    const validItems = items.filter(i => validIds.has(i.productId));
    if (validItems.length === 0) {
      return NextResponse.json({ error: "Aucun produit valide" }, { status: 400 });
    }

    const recomputedTotal = validItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Préparer les données de la commande
    const orderData: any = {
      userId: user.id,
      totalAmount: recomputedTotal,
      status: "pending",
      // On stocke l'adresse ou le numéro de table dans deliveryAddress
      deliveryAddress:
        orderType === "onSite"
          ? `Table n°${tableNumber}`
          : deliveryAddress,
      deliveryTime: orderType === "onSite" ? null : deliveryTime,
      // Optionnel : si vous avez un champ orderType, ajoutez-le ici
      // orderType,
    };

    const order = await prisma.order.create({
      data: {
        ...orderData,
        items: {
          create: validItems.map(i => ({
            productId: i.productId,
            quantity: i.quantity,
            priceAtTime: i.price,
          })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    // Envoyer l'email de confirmation à la boulangerie (en arrière-plan)
    // Ne pas attendre la résolution pour ne pas bloquer la réponse
    // ... dans la partie POST, après la création de la commande
    sendOrderConfirmationEmail(order).catch(console.error);

    // Si la requête vient de WhatsApp, on retourne un objet simplifié pour construire le message
    if (whatsapp) {
      // Construire une version simplifiée de la commande
      const simpleOrder = {
        orderId: order.id,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.priceAtTime,
        })),
        totalAmount: order.totalAmount,
        deliveryAddress: order.deliveryAddress,
        deliveryTime: order.deliveryTime,
        orderType,
        tableNumber: orderType === "onSite" ? tableNumber : undefined,
      };
      return NextResponse.json(simpleOrder, { status: 201 });
    }

    // Réponse normale (redirection vers /orders)
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}