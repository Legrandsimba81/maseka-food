import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const sender = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!sender) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

  const { receiverId, content } = await req.json();
  if (!receiverId || !content) {
    return NextResponse.json({ error: "Destinataire et contenu requis" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: {
      senderId: sender.id,
      receiverId,
      content,
    },
  });
  return NextResponse.json(message, { status: 201 });
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });

  const messages = await prisma.message.findMany({
    where: { receiverId: user.id },
    include: { sender: { select: { name: true, image: true, avatarUrl: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
}