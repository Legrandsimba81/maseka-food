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

  try {
    // Pour SQLite, on évite 'mode: insensitive' – on récupère toutes les commandes puis on filtre en JS
    let orders = await prisma.order.findMany({
      include: { user: true, items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Filtrage insensible à la casse (si un nom est recherché)
    if (userName) {
      orders = orders.filter(order => 
        order.user.name.toLowerCase().includes(userName.toLowerCase())
      );
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Erreur API admin/orders:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}