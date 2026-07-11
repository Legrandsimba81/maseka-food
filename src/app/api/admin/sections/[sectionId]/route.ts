import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function PUT(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, description, password } = await req.json();
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const data: any = {};
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.section.update({
      where: { id: params.sectionId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur modification section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}