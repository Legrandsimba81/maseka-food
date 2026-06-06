import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
  });

  // Récupérer l’ordre personnalisé depuis les paramètres
  const settings = await prisma.bakerySettings.findFirst();
  const categoryOrder = settings?.categoryOrder as string[] | null;
  if (!categoryOrder) {
    // fallback : ordre alphabétique des catégories
    products.sort((a, b) => a.category.localeCompare(b.category));
  } else {
    // Trier selon l’ordre défini
    const orderMap = new Map(categoryOrder.map((cat, idx) => [cat, idx]));
    products.sort((a, b) => {
      const indexA = orderMap.get(a.category) ?? 999;
      const indexB = orderMap.get(b.category) ?? 999;
      if (indexA !== indexB) return indexA - indexB;
      return a.name.localeCompare(b.name); // puis par nom
    });
  }
  return NextResponse.json(products);
}