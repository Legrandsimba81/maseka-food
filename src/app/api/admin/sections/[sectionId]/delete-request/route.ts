import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000); // 1 heure

    await prisma.section.update({
      where: { id: params.sectionId },
      data: {
        deleteToken: token,
        deleteTokenExpiry: expiry,
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maseka-food.vercel.app";
    const confirmUrl = `${baseUrl}/api/admin/sections/confirm-delete?token=${token}`;

    const html = `
      <h2>Confirmation de suppression de la section</h2>
      <p>Vous avez demandé la suppression de la section <strong>${section.name}</strong>.</p>
      <p>Cliquez sur le lien ci-dessous pour confirmer cette suppression :</p>
      <a href="${confirmUrl}">${confirmUrl}</a>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
    `;

    await sendEmail(
      session.user.email!,
      `Confirmation suppression section "${section.name}"`,
      html
    );

    return NextResponse.json({ success: true, message: "Email de confirmation envoyé" });
  } catch (error) {
    console.error("Erreur demande suppression:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}