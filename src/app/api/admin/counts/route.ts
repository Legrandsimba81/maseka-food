import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const [pendingOrders, pendingReservations, unreadMessages] = await Promise.all([
    prisma.order.count({ where: { status: "pending" } }),
    prisma.reservation.count({ where: { status: "pending" } }),
    prisma.message.count({ where: { read: false } }),
  ]);
  return NextResponse.json({ pendingOrders, pendingReservations, unreadMessages });
}