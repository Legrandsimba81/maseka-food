import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

function generateQRCodeId(): string {
  return randomBytes(8).toString("hex").toUpperCase();
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  const employees = await prisma.employee.findMany({
    where: {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { qrCode: { contains: search, mode: "insensitive" } },
      ],
    },
    include: {
      _count: { select: { attendances: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, position, department, image } = data;

    if (!firstName || !lastName || !position) {
      return NextResponse.json({ error: "Prénom, nom et poste requis" }, { status: 400 });
    }

    // Générer un QR code unique
    let qrCode = generateQRCodeId();
    let existing = await prisma.employee.findUnique({ where: { qrCode } });
    while (existing) {
      qrCode = generateQRCodeId();
      existing = await prisma.employee.findUnique({ where: { qrCode } });
    }

    const employee = await prisma.employee.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        position,
        department,
        image,
        qrCode,
        isActive: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}