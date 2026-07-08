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
  const month = parseInt(searchParams.get("month") || new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") || new Date().getFullYear().toString());

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 1);

  // Récupérer tous les employés actifs (ou tous)
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    include: {
      attendances: {
        where: {
          type: "entree",
          timestamp: { gte: startDate, lt: endDate },
        },
        select: { timestamp: true },
      },
    },
  });

  // Déterminer le nombre de jours à considérer
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let totalDays = daysInMonth;
  if (month === currentMonth && year === currentYear) {
    totalDays = now.getDate(); // jours écoulés jusqu'à aujourd'hui inclus
  }

  const stats = employees.map(emp => {
    const presenceDays = new Set(
      emp.attendances.map(a => a.timestamp.toISOString().split("T")[0])
    ).size;
    const absenceDays = Math.max(0, totalDays - presenceDays); // ne peut pas être négatif

    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      image: emp.image,
      totalDays,
      presenceDays,
      absenceDays,
      presenceRate: totalDays > 0 ? Math.round((presenceDays / totalDays) * 100) : 0,
    };
  });

  return NextResponse.json(stats);
}