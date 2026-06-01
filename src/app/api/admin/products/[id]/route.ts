import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });
  if (!product) {
    return NextResponse.json({ error: "Produit non trouvé" }, { status: 404 });
  }
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const body = await req.json();
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(updated);
}