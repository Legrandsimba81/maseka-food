import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { visitorId, page } = await req.json();
    if (!visitorId) {
      return NextResponse.json({ error: "visitorId requis" }, { status: 400 });
    }

    await prisma.pageView.create({
      data: {
        visitorId,
        page: page || null,
        createdAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur enregistrement visite:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}