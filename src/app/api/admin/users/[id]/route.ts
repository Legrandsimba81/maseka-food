import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 1. Un admin ne peut pas se supprimer lui-même
  if (params.id === session.user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 403 });
  }

  try {
    const targetUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!targetUser) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // 2. PROTECTION : le super-admin est intouchable
    if (targetUser.email === "admin@masekafood.com") {
      return NextResponse.json({ error: "Impossible de supprimer le super-administrateur" }, { status: 403 });
    }

    // (Optionnel) Si vous voulez interdire la suppression des admins (sauf super-admin), décommentez les lignes suivantes :
    if (targetUser.role === "admin") {
      return NextResponse.json({ error: "Impossible de supprimer un administrateur" }, { status: 403 });
    }

    // Supprimer les dépendances
    await prisma.message.deleteMany({ where: { OR: [{ senderId: params.id }, { receiverId: params.id }] } });
    await prisma.cart.deleteMany({ where: { userId: params.id } });
    await prisma.order.deleteMany({ where: { userId: params.id } });
    await prisma.reservation.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}