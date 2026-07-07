import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET – liste des produits avec filtres et recherche
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const status = searchParams.get("status") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { sku: { contains: search, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (status) where.status = status;

  try {
    const products = await prisma.stockProduct.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST – créer un produit
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const product = await prisma.stockProduct.create({
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
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}