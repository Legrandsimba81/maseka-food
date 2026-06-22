import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { role } = await req.json();
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // 1. Un admin ne peut pas modifier son propre rôle
    if (params.id === session.user.id) {
      return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 403 });
    }

    // 2. Récupérer l'utilisateur cible
    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // 3. PROTECTION : si l'utilisateur est le super-admin (email fixe), refuser toute modification
    if (targetUser.email === "admin@masekafood.com") {
      return NextResponse.json({ error: "Impossible de modifier le rôle du super-administrateur" }, { status: 403 });
    }

    // 4. Mise à jour
    const updated = await prisma.user.update({
      where: { id: params.id },
      data: { role },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}