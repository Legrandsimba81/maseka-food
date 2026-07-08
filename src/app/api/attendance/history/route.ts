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
  const month = parseInt(searchParams.get("month") ?? new Date().getMonth().toString());
  const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString());

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  endDate.setHours(23, 59, 59, 999);

  // Récupérer tous les employés actifs
  const employees = await prisma.employee.findMany({
    where: { isActive: true },
    include: {
      attendances: {
        where: {
          type: "entree",
          timestamp: { gte: startDate, lte: endDate },
        },
        select: { timestamp: true },
      },
    },
  });

  const totalDaysInMonth = endDate.getDate();

  const history = employees.map(emp => {
    const presentDates = new Set(
      emp.attendances.map(a => a.timestamp.toISOString().split("T")[0])
    );
    const presentDays = presentDates.size;
    const absentDays = totalDaysInMonth - presentDays;

    return {
      employeeId: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      position: emp.position,
      image: emp.image,
      totalDays: totalDaysInMonth,
      presentDays,
      absentDays,
      presenceRate: totalDaysInMonth > 0 ? Math.round((presentDays / totalDaysInMonth) * 100) : 0,
    };
  });

  return NextResponse.json(history);
}