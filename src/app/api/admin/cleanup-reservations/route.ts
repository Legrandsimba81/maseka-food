import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const now = new Date();
  // Supprime les réservations passées (date < aujourd'hui)
  const deletedReservations = await prisma.reservation.deleteMany({
    where: { date: { lt: now } },
  });
  // Optionnel : supprime les commandes en attente ou annulées de plus de 30 jours
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const deletedOrders = await prisma.order.deleteMany({
    where: {
      OR: [{ status: "cancelled" }, { status: "pending" }],
      createdAt: { lt: thirtyDaysAgo },
    },
  });
  return NextResponse.json({ deletedReservations, deletedOrders });
}