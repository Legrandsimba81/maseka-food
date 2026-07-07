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

    const attendance = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        type,
        device: device || "Web",
        ipAddress: ipAddress || req.headers.get("x-forwarded-for") || "unknown",
        location: location || null,
      },
      include: { employee: { select: { firstName: true, lastName: true, image: true } } },
    });

    return NextResponse.json({
      success: true,
      attendance,
      employee: {
        name: `${employee.firstName} ${employee.lastName}`,
        image: employee.image,
        position: employee.position,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}