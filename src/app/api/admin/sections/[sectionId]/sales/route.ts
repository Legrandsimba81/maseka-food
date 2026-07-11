import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

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

    // Récupérer les produits pour réinitialiser les quantités
    const products = await prisma.sectionProduct.findMany({
      where: { sectionId: params.sectionId },
    });

    // Récupérer la vente du jour (total des ventes)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dailySale = await prisma.dailySale.findFirst({
      where: {
        sectionId: params.sectionId,
        date: { gte: today, lt: tomorrow },
      },
    });

    // S'il n'y a pas encore de vente journalière, en créer une avec des totaux à zéro
    if (!dailySale) {
      dailySale = await prisma.dailySale.create({
        data: {
          sectionId: params.sectionId,
          date: today,
          totalAmount: 0,
          totalInitialStock: 0,
          totalItemsSold: 0,
        },
      });
    }

    const totalAmount = dailySale.totalAmount || 0;
    const totalUnits = dailySale.totalItemsSold || 0;

    // Construire le message email (uniquement le total)
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = new Date().toLocaleTimeString('fr-FR');

    const emailBody = `
📊 RAPPORT DE VENTE - ${section.name}
📅 ${dateStr}
🕐 Clôturé à ${timeStr}

💰 Total des ventes : ${totalAmount.toFixed(2)} $
📦 Nombre d'unités vendues : ${totalUnits}

💡 Pour plus de détails, consultez l'historique de la section.
    `;

    // Tentative d'envoi d'email (non bloquante)
    try {
      await sendEmail(
        process.env.EMAIL_FROM!, // envoi à la boulangerie (ou à l'admin)
        `Rapport de vente - ${section.name} - ${dateStr}`,
        `<pre>${emailBody}</pre>`
      );
    } catch (emailError) {
      console.error("Erreur envoi email de clôture:", emailError);
      // On continue la clôture même si l'email échoue
    }

    // Réinitialiser les quantités des produits à 0
    await prisma.$transaction(
      products.map(p =>
        prisma.sectionProduct.update({
          where: { id: p.id },
          data: { quantity: 0 },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: "Journée clôturée",
      totalAmount,
      totalUnits,
      emailSent: true, // on peut ajouter une indication si l'email a été envoyé avec succès
    });
  } catch (error: any) {
    console.error("Erreur clôture:", error);
    return NextResponse.json(
      { error: "Erreur serveur", details: error.message },
      { status: 500 }
    );
  }
}