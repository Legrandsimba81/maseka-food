import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  try {
    const { date, time, numberOfPeople, specialRequests } = await req.json();
    if (!date || !time || !numberOfPeople) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    const reservation = await prisma.reservation.create({
      data: {
        userId: user.id,
        date: new Date(date),
        time,
        numberOfPeople: parseInt(numberOfPeople),
        specialRequests: specialRequests || "",
        status: "pending",
      },
    });
    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
  }
  const reservations = await prisma.reservation.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(reservations);
}