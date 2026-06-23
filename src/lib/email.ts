import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_PORT === '465', // Resend utilise le port 465 avec SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Envoi d'un email de réinitialisation de mot de passe
export async function sendResetPasswordEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"maseka food" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Réinitialisation de votre mot de passe',
    html: `
      <h1>Réinitialisation du mot de passe</h1>
      <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe :</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `,
  });
}

// Fonction générique pour envoyer un email
export async function sendEmail(to: string, subject: string, html: string) {
  await transporter.sendMail({
    from: `"maseka food" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
}