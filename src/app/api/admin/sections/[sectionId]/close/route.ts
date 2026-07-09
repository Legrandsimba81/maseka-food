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

    const total = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
    const totalInitialStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalItemsSold = 0; // On ne peut pas le connaître directement, on le récupère depuis DailySale

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

    // Mettre à jour les stats de la vente
    if (dailySale) {
      await prisma.dailySale.update({
        where: { id: dailySale.id },
        data: {
          totalInitialStock,
          totalItemsSold: dailySale.totalItemsSold || 0,
          totalAmount: total,
        },
      });
    }

    // Créer le récapitulatif
    const details = products
      .filter(p => p.quantity > 0)
      .map(p => `${p.name} (${p.unit}): stock initial ${p.quantity} + ${p.quantity} vendus = ${p.quantity * p.price}$`)
      .join('\n');

    const message = `
📊 RAPPORT DE VENTE - ${section.name}
📅 ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
🕐 Clôturé à ${new Date().toLocaleTimeString('fr-FR')}

${details}
─────────────────
💰 TOTAL : ${total.toFixed(2)} $

Stock total initial : ${totalInitialStock} unités
Total vendu : ${dailySale?.totalItemsSold || 0} unités
    `;

    // Envoyer l'email
    await sendEmail(
      process.env.EMAIL_FROM!,
      `Rapport de vente - ${section.name} - ${new Date().toLocaleDateString('fr-FR')}`,
      `<pre>${message}</pre>`
    );

    // Réinitialiser les quantités à 0
    await prisma.$transaction(
      products.map(p =>
        prisma.sectionProduct.update({
          where: { id: p.id },
          data: { quantity: 0 },
        })
      )
    );

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("Erreur clôture:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}