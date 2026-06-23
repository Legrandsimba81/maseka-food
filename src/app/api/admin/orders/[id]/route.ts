import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// PUT : mise à jour statut, note admin, statut de livraison
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data: any = {};

    // 1. Statut général (pending, confirmed, cancelled)
    if (body.status !== undefined) data.status = body.status;

    // 2. Note administrateur
    if (body.adminNote !== undefined) data.adminNote = body.adminNote;

    // 3. 🟢 Statut de livraison (Nouveau !)
    if (body.deliveryStatus !== undefined) {
      data.deliveryStatus = body.deliveryStatus;
    }

    // Si aucun champ n'est fourni, on renvoie une erreur
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune donnée à mettre à jour" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Erreur PUT /admin/orders/[id]:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE : suppression d'une commande (et de ses lignes)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Supprimer d'abord les lignes de commande (OrderItem)
    await prisma.orderItem.deleteMany({ where: { orderId: params.id } });
    // Supprimer la commande
    await prisma.order.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur DELETE /admin/orders/[id]:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}