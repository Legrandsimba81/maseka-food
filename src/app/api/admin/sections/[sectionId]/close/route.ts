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

    // Créer le récapitulatif
    const details = products
      .filter(p => p.quantity > 0)
      .map(p => `${p.name}: ${p.quantity} x ${p.price}$ = ${(p.quantity * p.price).toFixed(2)}$`)
      .join('\n');

    const message = `
📊 RAPPORT DE VENTE - ${section.name}
📅 ${new Date().toLocaleDateString('fr-FR')}
🕐 Clôturé à ${new Date().toLocaleTimeString('fr-FR')}

${details}
─────────────────
💰 TOTAL : ${total.toFixed(2)} $

Ventes enregistrées : ${products.reduce((sum, p) => sum + p.quantity, 0)} articles
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