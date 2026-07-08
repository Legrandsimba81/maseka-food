import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { productId, type, quantity, reason } = await req.json();

    if (!productId || !type || !quantity) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    if (!["entree", "sortie"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    if (quantity <= 0) {
      return NextResponse.json({ error: "La quantité doit être positive" }, { status: 400 });
    }

    // Vérifier que le produit existe
    const product = await prisma.stockProduct.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    // Vérifier le stock si sortie
    if (type === "sortie" && product.quantity < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
    }

    // Démarrer une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour la quantité
      const newQuantity = type === "entree" ? product.quantity + quantity : product.quantity - quantity;
      const updatedProduct = await tx.stockProduct.update({
        where: { id: productId },
        data: {
          quantity: newQuantity,
          // Mise à jour du statut automatique
          status: newQuantity === 0 ? "rupture" : newQuantity <= product.minStock ? "faible_stock" : "disponible",
        },
      });

      // Créer le mouvement
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          type,
          quantity,
          reason: reason || null,
        },
      });

      return { product: updatedProduct, movement };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur mouvement stock:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}