import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isAvailable: true },
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}