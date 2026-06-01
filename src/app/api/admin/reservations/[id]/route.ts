import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT : mise à jour du statut et/ou note
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const { status, adminNote } = await req.json();
    const updated = await prisma.reservation.update({
      where: { id: params.id },
      data: { status, adminNote },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PUT réservation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : suppression d'une réservation
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    // Vérifier que la réservation existe
    const reservation = await prisma.reservation.findUnique({
      where: { id: params.id },
    });
    if (!reservation) {
      return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 });
    }
    // Supprimer la réservation
    await prisma.reservation.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression réservation:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}