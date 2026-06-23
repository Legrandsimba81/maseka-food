import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { userId, subject, message } = await req.json();
  if (!subject || !message) {
    return NextResponse.json({ error: "Sujet et message requis" }, { status: 400 });
  }

  try {
    if (userId === "all") {
      // Envoyer à tous les utilisateurs
      const users = await prisma.user.findMany({ select: { email: true } });
      const emails = users.map(u => u.email).filter(Boolean);
      for (const email of emails) {
        await sendEmail(email, subject, `<p>${message}</p>`);
      }
      return NextResponse.json({ success: true, sentTo: emails.length });
    } else {
      // Envoyer à un utilisateur spécifique
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
      }
      await sendEmail(user.email, subject, `<p>${message}</p>`);
      return NextResponse.json({ success: true, sentTo: user.email });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur d'envoi" }, { status: 500 });
  }
}