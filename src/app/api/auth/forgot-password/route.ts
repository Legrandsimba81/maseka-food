import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json({ error: 'Email requis' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Pour des raisons de sécurité, on ne révèle pas que l'email n'existe pas
    return NextResponse.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 3600000); // 1 heure

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken: token, resetTokenExpiry: expires },
  });

  await sendResetPasswordEmail(email, token);

  return NextResponse.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
}