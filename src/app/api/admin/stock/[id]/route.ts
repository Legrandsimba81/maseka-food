import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendStockMovementEmail, sendStockAlertEmail } from "@/lib/email";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const product = await prisma.stockProduct.findUnique({
    where: { id: params.id },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const product = await prisma.stockProduct.findUnique({
      where: { id: params.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    }

    const previousQuantity = product.quantity;
    const newQuantity = body.quantity;

    const updatedProduct = await prisma.stockProduct.update({
      where: { id: params.id },
      data: {
        sku: body.sku,
        name: body.name,
        category: body.category,
        imageUrl: body.imageUrl,
        quantity: newQuantity,
        unit: body.unit,
        minStock: body.minStock,
        price: body.price,
        purchasePrice: body.purchasePrice,
        status: body.status,
        manufacturingDate: body.manufacturingDate ? new Date(body.manufacturingDate) : undefined,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
      },
    });

    // Si la quantité a changé, envoyer les emails
    if (body.quantity !== undefined && newQuantity !== previousQuantity) {
      const diff = Math.abs(newQuantity - previousQuantity);
      const type = newQuantity > previousQuantity ? "entree" : "sortie";

      // 1. Email de mouvement (toujours envoyé)
      sendStockMovementEmail(
        updatedProduct.name,
        updatedProduct.sku,
        updatedProduct.unit,
        type,
        diff,
        newQuantity,
        "Modification manuelle du stock",
        previousQuantity
      ).catch(console.error);

      // 2. Alerte stock faible (si sortie et nouvelle quantité sous le seuil)
      if (type === "sortie" && newQuantity < product.minStock) {
        sendStockAlertEmail(
          updatedProduct.name,
          updatedProduct.sku,
          newQuantity,
          product.minStock
        ).catch(console.error);
      }
    }

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Erreur mise à jour stock:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await prisma.stockProduct.delete({
    where: { id: params.id },
  });
  return NextResponse.json({ success: true });
}