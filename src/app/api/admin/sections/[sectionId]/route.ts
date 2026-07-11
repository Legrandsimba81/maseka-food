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
    const { name, description, password } = await req.json();
    const section = await prisma.section.findUnique({
      where: { id: params.sectionId },
    });
    if (!section) {
      return NextResponse.json({ error: "Section non trouvée" }, { status: 404 });
    }

    const data: any = {};
    let changes = [];
    if (name && name !== section.name) {
      data.name = name;
      changes.push(`Nom : "${section.name}" → "${name}"`);
    }
    if (description !== undefined && description !== section.description) {
      data.description = description;
      changes.push(`Description : "${section.description || '(vide)'}" → "${description || '(vide)'}"`);
    }
    if (password) {
      data.password = await bcrypt.hash(password, 10);
      changes.push("Mot de passe modifié");
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Aucune modification" }, { status: 400 });
    }

    const updated = await prisma.section.update({
      where: { id: params.sectionId },
      data,
    });

    // Email de notification
    const adminEmail = session.user.email!;
    const changesText = changes.join("\n");
    await sendEmail(
      adminEmail,
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

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur modification section:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}