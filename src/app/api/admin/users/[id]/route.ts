import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Supprimer les dépendances : messages, cart, orders, reservations
    await prisma.message.deleteMany({ where: { OR: [{ senderId: params.id }, { receiverId: params.id }] } });
    await prisma.cart.deleteMany({ where: { userId: params.id } });
    await prisma.order.deleteMany({ where: { userId: params.id } });
    await prisma.reservation.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}