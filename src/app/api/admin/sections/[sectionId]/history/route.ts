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

  const date = new Date(dateParam);
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const dailySale = await prisma.dailySale.findFirst({
    where: {
      sectionId: params.sectionId,
      date: { gte: date, lt: nextDay },
    },
    include: {
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({
    history: dailySale ? [dailySale] : [],
    detail: dailySale,
  });
}