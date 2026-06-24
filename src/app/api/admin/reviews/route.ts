import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Récupérer les avis sur les produits
    const productReviews = await prisma.productReview.findMany({
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        product: { select: { name: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Récupérer les avis sur la boulangerie
    const bakeryReviews = await prisma.bakeryReview.findMany({
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Ajouter un champ `type` pour distinguer
    const formattedProductReviews = productReviews.map(r => ({
      ...r,
      type: "product",
      productName: r.product?.name,
    }));
    const formattedBakeryReviews = bakeryReviews.map(r => ({
      ...r,
      type: "bakery",
      productName: null,
    }));

    const allReviews = [...formattedProductReviews, ...formattedBakeryReviews];
    // Trier par date décroissante
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(allReviews);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { id, type } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ error: "ID et type requis" }, { status: 400 });
    }

    if (type === "product") {
      await prisma.productReview.delete({ where: { id } });
    } else if (type === "bakery") {
      await prisma.bakeryReview.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}