import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  const pendingReservations = await prisma.reservation.count({
    where: { userId: user.id, status: "pending" },
  });
  const pendingOrders = await prisma.order.count({
    where: { userId: user.id, status: "pending" },
  });
  const unreadMessages = await prisma.message.count({
    where: { receiverId: user.id, read: false },
  });

  return NextResponse.json({ pendingReservations, pendingOrders, unreadMessages });
}