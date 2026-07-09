import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET – Liste des sections (admin uniquement)
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const sections = await prisma.section.findMany({
    include: {
      _count: { select: { products: true, dailySales: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sections);
}

// POST – Créer une section (admin uniquement)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, password, description } = await req.json();
    if (!name || !password) {
      return NextResponse.json({ error: "Nom et mot de passe requis" }, { status: 400 });
    }

    const existing = await prisma.section.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Cette section existe déjà" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const section = await prisma.section.create({
      data: {
        name,
        password: hashedPassword,
        description,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error("Erreur création section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}