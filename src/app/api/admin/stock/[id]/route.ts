import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendStockMovementEmail } from "@/lib/email";

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

    const updatedProduct = await prisma.stockProduct.update({
      where: { id: params.id },
      data: {
        sku: body.sku,
        name: body.name,
        category: body.category,
        imageUrl: body.imageUrl,
        quantity: body.quantity,
        unit: body.unit,
        minStock: body.minStock,
        price: body.price,
        purchasePrice: body.purchasePrice,
        status: body.status,
        manufacturingDate: body.manufacturingDate ? new Date(body.manufacturingDate) : undefined,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : undefined,
      },
    });

    // Si la quantité a changé, envoyer un email
    if (body.quantity !== undefined && body.quantity !== product.quantity) {
      const previousQuantity = product.quantity;
      const newQuantity = body.quantity;
      const diff = Math.abs(newQuantity - previousQuantity);
      const type = newQuantity > previousQuantity ? "entree" : "sortie";

      await sendStockMovementEmail(
        updatedProduct.name,
        updatedProduct.sku,
        updatedProduct.unit,
        type,
        diff,
        newQuantity,
        "Modification manuelle du stock",
        previousQuantity
      ).catch(console.error);
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