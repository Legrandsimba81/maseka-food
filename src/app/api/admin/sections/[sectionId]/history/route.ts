import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  if (!dateParam) {
    return NextResponse.json({ error: "Date requise" }, { status: 400 });
  }

  const selectedDate = new Date(dateParam);
  selectedDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(selectedDate);
  nextDay.setDate(nextDay.getDate() + 1);

  // 1. Récupérer les détails du jour sélectionné
  const dailySale = await prisma.dailySale.findFirst({
    where: {
      sectionId: params.sectionId,
      date: { gte: selectedDate, lt: nextDay },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  // 2. Récupérer les stats du mois (tous les jours du mois)
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1);

  const monthSales = await prisma.dailySale.findMany({
    where: {
      sectionId: params.sectionId,
      date: { gte: monthStart, lt: monthEnd },
    },
    select: {
      totalAmount: true,
      date: true,
    },
    orderBy: { date: 'asc' },
  });

  const totalMonth = monthSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  let maxDay = null;
  if (monthSales.length > 0) {
    const maxSale = monthSales.reduce((max, sale) => sale.totalAmount > max.totalAmount ? sale : max, monthSales[0]);
    maxDay = {
      date: maxSale.date,
      amount: maxSale.totalAmount,
    };
  }

  return NextResponse.json({
    detail: dailySale,
    monthSummary: {
      total: totalMonth,
      maxDay: maxDay,
    },
  });
}