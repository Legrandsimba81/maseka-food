import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/email";

// PUT – Modifier une section
export async function PUT(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { name, description, currentPassword, newPassword } = await req.json();
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const data: any = {};
    let changes: string[] = [];

    if (name && name !== section.name) {
      data.name = name;
      changes.push(`Nom : "${section.name}" → "${name}"`);
    }
    if (description !== undefined && description !== section.description) {
      data.description = description;
      changes.push(`Description : "${section.description || '(vide)'}" → "${description || '(vide)'}"`);
    }
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Veuillez fournir le mot de passe actuel pour le changer" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(currentPassword, section.password);
      if (!isValid) {
        return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 401 });
      }
      data.password = await bcrypt.hash(newPassword, 10);
      changes.push("Mot de passe modifié");
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
    }

    const updated = await prisma.section.update({
      where: { id: params.sectionId },
      data,
    });

    // Email de notification (non bloquant)
    try {
      await sendEmail(
        session.user.email!,
        `Modification de la section "${section.name}"`,
        `
          <h2>📝 Modification de la section</h2>
          <p><strong>Section :</strong> ${section.name}</p>
          <p>Les modifications suivantes ont été effectuées :</p>
          <ul>
            ${changes.map(c => `<li>${c}</li>`).join('')}
          </ul>
          <p>Si vous n'êtes pas à l'origine de ces modifications, veuillez contacter immédiatement l'administrateur.</p>
        `
      );
    } catch (emailError) {
      console.error("Erreur envoi email:", emailError);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur modification section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE – Supprimer une section (avec mot de passe)
export async function DELETE(
  req: Request,
  { params }: { params: { sectionId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json({ error: "Mot de passe requis" }, { status: 400 });
    }

    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, section.password);
    if (!isValid) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    await prisma.section.delete({
      where: { id: params.sectionId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur suppression section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}