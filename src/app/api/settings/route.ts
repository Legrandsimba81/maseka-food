import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET public (pour lire le taux de change, par exemple)
export async function GET() {
  const settings = await prisma.bakerySettings.findFirst();
  return NextResponse.json(settings);
}

// PUT réservé à l'admin pour modifier les paramètres
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const data = await req.json();
  const existing = await prisma.bakerySettings.findFirst();
  if (existing) {
    const updated = await prisma.bakerySettings.update({
      where: { id: existing.id },
      data,
    });
    return NextResponse.json(updated);
  } else {
    const created = await prisma.bakerySettings.create({ data });
    return NextResponse.json(created);
  }
}