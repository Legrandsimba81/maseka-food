import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { status, adminNote, deliveryStatus } = body;

    // Préparer les données à mettre à jour
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (adminNote !== undefined) data.adminNote = adminNote;
    if (deliveryStatus !== undefined) data.deliveryStatus = deliveryStatus;

    // Vérifier que la commande existe
    const existing = await prisma.order.findUnique({
      where: { id: params.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur PUT commande:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  try {
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}