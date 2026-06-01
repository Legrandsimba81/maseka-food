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
    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status, adminNote },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PUT commande:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE : suppression d'une commande
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });
    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }
    await prisma.order.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression commande:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}