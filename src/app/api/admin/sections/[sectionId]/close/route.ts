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

    // Récupérer les produits du jour
    const products = await prisma.sectionProduct.findMany({
      where: { sectionId: params.sectionId },
    });

    // Calculs des totaux
    const totalAmount = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);

    // Mise à jour des statistiques dans DailySale (si existant)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailySale = await prisma.dailySale.findFirst({
      where: {
        sectionId: params.sectionId,
        date: { gte: today, lt: tomorrow },
      },
    });

    if (dailySale) {
      await prisma.dailySale.update({
        where: { id: dailySale.id },
        data: {
          totalAmount: totalAmount,
          totalItemsSold: totalUnits,
        },
      });
    }

    // Construction du message simplifié
    const dateStr = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeStr = new Date().toLocaleTimeString('fr-FR');

    const message = `
📊 RAPPORT DE VENTE - ${section.name}
📅 ${dateStr}
🕐 Clôturé à ${timeStr}

💰 Total des ventes : ${totalAmount.toFixed(2)} $
📦 Nombre total d'unités vendues : ${totalUnits}

💡 Pour consulter le détail des ventes, rendez-vous dans l'historique de la section.
    `;

    // Envoi de l'email
    await sendEmail(
      process.env.EMAIL_FROM!,
      `Rapport de vente - ${section.name} - ${dateStr}`,
      `<pre>${message}</pre>`
    );

    // Réinitialisation des quantités à 0
    await prisma.$transaction(
      products.map(p =>
        prisma.sectionProduct.update({
          where: { id: p.id },
          data: { quantity: 0 },
        })
      )
    );

    return NextResponse.json({ success: true, message: "Journée clôturée" });
  } catch (error) {
    console.error("Erreur clôture:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}