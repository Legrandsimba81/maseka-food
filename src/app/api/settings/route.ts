import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET public (lecture des paramètres)
export async function GET() {
  try {
    const settings = await prisma.bakerySettings.findFirst();
    return NextResponse.json(settings || {});
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// PUT réservé à l'admin (mise à jour)
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const existing = await prisma.bakerySettings.findFirst();
    let updated;
    if (existing) {
      updated = await prisma.bakerySettings.update({
        where: { id: existing.id },
        data: body,
      });
    } else {
      updated = await prisma.bakerySettings.create({ data: body });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}