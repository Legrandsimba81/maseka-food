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
    const { exchangeRate } = await req.json();
    if (typeof exchangeRate !== "number" || exchangeRate <= 0) {
      return NextResponse.json({ error: "Taux invalide" }, { status: 400 });
    }
    const existing = await prisma.bakerySettings.findFirst();
    let updated;
    if (existing) {
      updated = await prisma.bakerySettings.update({
        where: { id: existing.id },
        data: { exchangeRate },
      });
    } else {
      updated = await prisma.bakerySettings.create({
        data: { bakeryName: "maseka food", exchangeRate },
      });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}