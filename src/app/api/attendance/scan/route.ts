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

    // Vérifier si l'employé a déjà pointé aujourd'hui pour ce type
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        type,
        date: { gte: today },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: `L'employé a déjà enregistré une ${type === "entree" ? "entrée" : "sortie"} aujourd'hui` },
        { status: 409 }
      );
    }

    // Enregistrer le pointage
    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: device || null,
        ipAddress: ipAddress || null,
        location: location || null,
        date: new Date(),
      },
      include: { employee: true },
    });

    return NextResponse.json({
      success: true,
      attendance,
      employee: {
        firstName: employee.firstName,
        lastName: employee.lastName,
        position: employee.position,
        image: employee.image,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}