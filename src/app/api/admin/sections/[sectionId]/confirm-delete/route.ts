import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token manquant" }, { status: 400 });
  }

  try {
    const section = await prisma.section.findFirst({
      where: {
        deleteToken: token,
        deleteTokenExpiry: { gt: new Date() },
      },
    });

    if (!section) {
      return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 400 });
    }

    // Supprimer la section (les relations avec onDelete: Cascade seront supprimées automatiquement)
    await prisma.section.delete({
      where: { id: section.id },
    });

    return NextResponse.json({ success: true, message: "Section supprimée avec succès" });
  } catch (error) {
    console.error("Erreur confirmation suppression:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}