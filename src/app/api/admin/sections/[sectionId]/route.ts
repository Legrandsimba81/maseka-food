import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

export async function PUT(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, description, password, currentPassword } = await req.json();

    // Vérifier que le mot de passe actuel est fourni
    if (!currentPassword) {
      return NextResponse.json({ error: "Mot de passe actuel requis" }, { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    // Vérifier le mot de passe actuel
    const isValid = await bcrypt.compare(currentPassword, section.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
    }

    // Préparer les données de mise à jour
    const data: any = {};
    let passwordChanged = false;
    if (name) data.name = name;
    if (description !== undefined) data.description = description;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
      passwordChanged = true;
    }

    // Vérifier si des modifications sont demandées
    const hasChanges = Object.keys(data).length > 0;
    if (!hasChanges) {
      return NextResponse.json({ error: "Aucune modification demandée" }, { status: 400 });
    }

    const updated = await prisma.section.update({
      where: { id: params.sectionId },
      data,
    });

    // Envoyer un email de notification à l'admin
    const adminEmail = session.user.email!;
    const changes = [];
    if (name) changes.push(`Nom: ${section.name} → ${name}`);
    if (description !== undefined && description !== section.description) changes.push(`Description: ${section.description || "(vide)"} → ${description || "(vide)"}`);
    if (passwordChanged) changes.push("Mot de passe: modifié");

    const emailHtml = `
      <h2>Modification de la section "${section.name}"</h2>
      <p>Bonjour,</p>
      <p>La section <strong>${section.name}</strong> a été modifiée par ${session.user.name || "l'administrateur"} (${session.user.email}).</p>
      <ul>
        ${changes.map(c => `<li>${c}</li>`).join('')}
      </ul>
      <p>Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement le support.</p>
    `;

    await sendEmail(
      adminEmail,
      `Modification de la section "${section.name}"`,
      emailHtml
    ).catch(console.error); // ne pas bloquer la réponse

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur modification section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}