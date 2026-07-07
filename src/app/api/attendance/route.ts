import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST – enregistrer un pointage (scan QR)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { qrCode, type, device, ipAddress, location } = await req.json();
    if (!qrCode || !type) {
      return NextResponse.json({ error: "QR Code et type requis" }, { status: 400 });
    }
    if (!["entree", "sortie"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }

    // 1. Trouver l'employé via son qrCode
    const employee = await prisma.employee.findUnique({
      where: { qrCode },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 });
    }
    if (!employee.isActive) {
      return NextResponse.json({ error: "Employé inactif" }, { status: 403 });
    }

    // 2. Vérifier si l'employé a déjà pointé aujourd'hui (pour le type "entree")
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (type === "entree") {
      const existingEntry = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          type: "entree",
          timestamp: { gte: today, lt: tomorrow },
        },
      });
      if (existingEntry) {
        return NextResponse.json(
          { error: "Pointage d'entrée déjà enregistré aujourd'hui" },
          { status: 409 }
        );
      }
    }

    // 3. Enregistrer le pointage
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: device || "Web",
        ipAddress: ipAddress || null,
        location: location || null,
      },
      include: { employee: true },
    });

    // 4. Retourner l'employé avec le pointage
    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        image: employee.image,
      },
      attendance,
    });
  } catch (error) {
    console.error("Erreur pointage:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}