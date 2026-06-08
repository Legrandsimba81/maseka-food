import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const userName = searchParams.get("userName") || "";
  const status = searchParams.get("status") || "";

  let orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (userName) {
    orders = orders.filter(order =>
      order.user?.name?.toLowerCase().includes(userName.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(userName.toLowerCase())
    );
  }
  if (status && status !== "all") {
    orders = orders.filter(order => order.status === status);
  }
  return NextResponse.json(orders);
}