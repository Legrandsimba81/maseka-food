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
  console.log(`[delete-request] Début pour la section: ${params.sectionId}`);

  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    console.log("[delete-request] Accès non autorisé");
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  console.log(`[delete-request] Email de l'utilisateur: ${session.user.email}`);

  try {
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      console.log(`[delete-request] Section ${params.sectionId} non trouvée`);
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600 * 1000);

    console.log(`[delete-request] Token généré: ${token}`);

    await prisma.section.update({
      where: { id: params.sectionId },
      data: {
        deleteToken: token,
        deleteTokenExpiry: expiry,
      },
    });
    console.log(`[delete-request] Section mise à jour avec le token`);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://maseka-food.vercel.app";
    const confirmUrl = `${baseUrl}/api/admin/sections/confirm-delete?token=${token}`;

    // Envoi de l'email (bloquant mais avec try/catch)
    try {
      await sendEmail(
        session.user.email!,
        `Confirmation suppression section "${section.name}"`,
        `
          <h2>⚠️ Confirmation de suppression</h2>
          <p>Vous avez demandé la suppression de la section <strong>${section.name}</strong>.</p>
          <p>Cliquez sur le lien ci-dessous pour confirmer :</p>
          <a href="${confirmUrl}">${confirmUrl}</a>
          <p>Ce lien expire dans 1 heure.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
        `
      );
      console.log(`[delete-request] Email envoyé avec succès`);
    } catch (emailError: any) {
      console.error("[delete-request] Erreur lors de l'envoi de l'email:", emailError);
      // On retourne une erreur explicite
      return NextResponse.json(
        {
          error: "Erreur lors de l'envoi de l'email de confirmation",
          details: emailError.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Email de confirmation envoyé" });
  } catch (error: any) {
    console.error("[delete-request] Erreur générale:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}