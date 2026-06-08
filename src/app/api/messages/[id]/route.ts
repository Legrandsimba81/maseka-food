import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });

  // Vérifier que le message appartient bien à l'utilisateur (destinataire)
  const message = await prisma.message.findFirst({
    where: { id: params.id, receiverId: user.id },
  });
  if (!message) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }

  await prisma.message.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}