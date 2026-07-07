import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const product = await prisma.stockProduct.findUnique({ where: { id: params.id } });
    if (!product) return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const data = await req.json();
    const updated = await prisma.stockProduct.update({
      where: { id: params.id },
      data: {
        sku: data.sku,
        name: data.name,
        category: data.category,
        imageUrl: data.imageUrl,
        quantity: parseInt(data.quantity) || 0,
        unit: data.unit || "pièce",
        minStock: parseInt(data.minStock) || 5,
        price: data.price ? parseFloat(data.price) : null,
        status: data.status || "disponible",
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : null,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await prisma.stockProduct.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}