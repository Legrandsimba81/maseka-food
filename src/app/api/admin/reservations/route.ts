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
    let reservations = await prisma.reservation.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { date: "desc" },
    });

    if (userName) {
      reservations = reservations.filter(
        (res) =>
          res.user &&
          res.user.name.toLowerCase().includes(userName.toLowerCase())
      );
    }

    return NextResponse.json(reservations);
  } catch (error) {
    console.error("Erreur API admin/reservations:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}