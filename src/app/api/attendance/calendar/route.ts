import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    const monthParam = searchParams.get("month");
    const yearParam = searchParams.get("year");

    if (!employeeId || employeeId.trim() === "") {
      return NextResponse.json({ error: "employeeId requis" }, { status: 400 });
    }

    const month = monthParam ? parseInt(monthParam, 10) : new Date().getMonth();
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 });
    }

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true },
      distinct: ['date'],
    });

    const presentDates = new Set(
      attendances.map(a => a.date.toISOString().split('T')[0])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];
    for (let d = 1; d <= endDate.getDate(); d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      let status: "present" | "absent" | "future" = "absent";

      if (presentDates.has(dateStr)) {
        status = "present";
      } else if (dateObj > today) {
        status = "future";
      }
      days.push({ date: dateStr, status });
    }

    return NextResponse.json({ days });
  } catch (error) {
    console.error("Erreur API calendrier :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}