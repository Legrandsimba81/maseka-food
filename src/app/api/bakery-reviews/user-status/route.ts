import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ hasReviewed: false });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });
  if (!user) return NextResponse.json({ hasReviewed: false });
  const review = await prisma.bakeryReview.findFirst({
    where: { userId: user.id },
  });
  return NextResponse.json({ hasReviewed: !!review });
}