import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendStockMovementEmail } from "@/lib/email";

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

    const product = await prisma.stockProduct.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    if (type === "sortie" && product.quantity < quantity) {
      return NextResponse.json({ error: "Stock insuffisant" }, { status: 400 });
    }

    const previousQuantity = product.quantity;
    const newQuantity = type === "entree" ? product.quantity + quantity : product.quantity - quantity;

    // Mise à jour du produit
    const updatedProduct = await prisma.stockProduct.update({
      where: { id: productId },
      data: {
        quantity: newQuantity,
        status: newQuantity === 0 ? "rupture" : newQuantity <= product.minStock ? "faible_stock" : "disponible",
      },
    });

    // Création du mouvement
    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        type,
        quantity,
        reason: reason || null,
      },
    });

    // Envoi de l'email (ne pas bloquer la réponse)
    sendStockMovementEmail(
      product.name,
      product.sku,
      product.unit,
      type,
      quantity,
      newQuantity,
      reason || undefined,
      previousQuantity
    ).catch(console.error);

    return NextResponse.json({ product: updatedProduct, movement });
  } catch (error) {
    console.error("Erreur mouvement stock:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}