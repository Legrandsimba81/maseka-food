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

  const employees = await prisma.employee.findMany({
    include: {
      attendances: {
        where: {
          type: "entree",
          timestamp: { gte: startDate, lt: endDate },
        },
        select: {
          timestamp: true,
        },
      },
    },
  });

  const stats = employees.map(emp => {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const presenceDays = new Set(emp.attendances.map(a => a.timestamp.toISOString().split("T")[0])).size;
    const absenceDays = totalDays - presenceDays;

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