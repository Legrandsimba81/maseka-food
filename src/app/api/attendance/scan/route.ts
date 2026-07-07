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
    const { qrCode, type, deviceInfo, ipAddress, location } = await req.json();

    if (!qrCode || !type || !["entree", "sortie"].includes(type)) {
      return NextResponse.json({ error: "QR Code et type (entree/sortie) requis" }, { status: 400 });
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Vérifier si un pointage du même type existe déjà aujourd'hui
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        type,
        timestamp: { gte: today },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Vous avez déjà un pointage ${type === "entree" ? "d'entrée" : "de sortie"} aujourd'hui.` },
        { status: 400 }
      );
    }

    // Enregistrer le pointage
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: deviceInfo || null,
        ipAddress: ipAddress || null,
        location: location || null,
        date: new Date(),
      },
      include: { employee: true },
    });

    return NextResponse.json(attendance, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}