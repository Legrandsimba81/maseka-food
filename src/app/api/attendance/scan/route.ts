import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const { qrCode, type, device, ipAddress, location } = await req.json();
    if (!qrCode || !type || !["entree", "sortie"].includes(type)) {
      return NextResponse.json({ error: "QR Code et type requis" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { qrCode },
    });
    if (!employee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 });
    }
    if (!employee.isActive) {
      return NextResponse.json({ error: "Employé inactif" }, { status: 403 });
    }

    // Vérifier si l'employé a déjà pointé aujourd'hui pour le type "entree"
    if (type === "entree") {
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const existingEntry = await prisma.attendance.findFirst({
        where: {
          employeeId: employee.id,
          type: "entree",
          timestamp: { gte: startOfDay, lt: endOfDay },
        },
      });
      if (existingEntry) {
        return NextResponse.json({ error: "Présence déjà enregistrée aujourd'hui" }, { status: 409 });
      }
    }

    // Enregistrer le pointage
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: device || "Web",
        ipAddress: ipAddress || "unknown",
        location: location || null,
        date: new Date(),
      },
      include: { employee: true },
    });

    return NextResponse.json({
      success: true,
      attendance,
      employee: {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        image: employee.image,
      },
      type,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}