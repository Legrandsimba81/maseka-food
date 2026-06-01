import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  const { name, email } = await req.json();
  const updated = await prisma.user.update({
    where: { email: session.user.email },
    data: { name, email },
  });
  return NextResponse.json(updated);
}