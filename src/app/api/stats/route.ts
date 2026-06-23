import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total des pages vues
    const totalViews = await prisma.pageView.count();

    // Pages vues aujourd'hui
    const todayViews = await prisma.pageView.count({
      where: { createdAt: { gte: startOfDay } },
    });

    // Pages vues ce mois-ci
    const monthViews = await prisma.pageView.count({
      where: { createdAt: { gte: startOfMonth } },
    });

    // Visiteurs uniques (tout temps)
    const uniqueVisitorsTotal = await prisma.pageView.groupBy({
      by: ["visitorId"],
    }).then((groups) => groups.length);

    // Visiteurs uniques aujourd'hui
    const uniqueVisitorsToday = await prisma.pageView.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: startOfDay } },
    }).then((groups) => groups.length);

    // Visiteurs uniques ce mois-ci
    const uniqueVisitorsMonth = await prisma.pageView.groupBy({
      by: ["visitorId"],
      where: { createdAt: { gte: startOfMonth } },
    }).then((groups) => groups.length);

    return NextResponse.json({
      totalViews,
      todayViews,
      monthViews,
      uniqueVisitorsTotal,
      uniqueVisitorsToday,
      uniqueVisitorsMonth,
    });
  } catch (error) {
    console.error("Erreur stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}