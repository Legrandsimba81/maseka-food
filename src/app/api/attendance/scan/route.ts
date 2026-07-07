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

    if (!qrCode || !type) {
      return NextResponse.json({ error: "QR Code et type requis" }, { status: 400 });
    }

    // ⚠️ RECHERCHE PAR qrCode (et non par token ou id)
    const employee = await prisma.employee.findUnique({
      where: { qrCode },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employé non trouvé" }, { status: 404 });
    }

    if (!employee.isActive) {
      return NextResponse.json({ error: "Employé inactif" }, { status: 403 });
    }

    // Vérifier que l'employé n'a pas déjà pointé aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        type: type, // "entree" ou "sortie"
        timestamp: { gte: today, lt: tomorrow },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: `Pointage ${type === "entree" ? "entrée" : "sortie"} déjà enregistré aujourd'hui` },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: device || "Web",
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