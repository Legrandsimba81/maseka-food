import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Récupérer les horaires configurés
  const settings = await prisma.bakerySettings.findFirst();
  const workStart = settings?.workStart || "08:00";
  const workStartMinutes = parseInt(workStart.split(":")[0]) * 60 + parseInt(workStart.split(":")[1]);

  const employees = await prisma.employee.findMany({
    include: {
      attendances: {
        orderBy: { timestamp: "asc" },
      },
    },
  });

  const ranking = employees.map(emp => {
    const entries = emp.attendances.filter(a => a.type === "entree");
    const totalEntries = entries.length;
    let lateCount = 0;
    let onTimeCount = 0;

    entries.forEach(entry => {
      const entryHour = entry.timestamp.getHours();
      const entryMinute = entry.timestamp.getMinutes();
      const entryMinutes = entryHour * 60 + entryMinute;
      if (entryMinutes > workStartMinutes) {
        lateCount++;
      } else {
        onTimeCount++;
      }
    });

    const punctualityRate = totalEntries > 0 ? (onTimeCount / totalEntries) * 100 : 0;

    return {
      id: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      position: emp.position,
      image: emp.image,
      totalEntries,
      lateCount,
      onTimeCount,
      punctualityRate: Math.round(punctualityRate * 10) / 10,
    };
  });

  ranking.sort((a, b) => b.punctualityRate - a.punctualityRate);
  return NextResponse.json(ranking);
}