import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { categoryOrder } = await req.json();
  const existing = await prisma.bakerySettings.findFirst();
  if (existing) {
    const updated = await prisma.bakerySettings.update({
      where: { id: existing.id },
      data: { categoryOrder },
    });
    return NextResponse.json(updated);
  } else {
    const created = await prisma.bakerySettings.create({
      data: { categoryOrder },
    });
    return NextResponse.json(created);
  }
}