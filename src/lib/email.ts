import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendReservationStatusEmail(to: string, status: string, reservation: any) {
  const subject = status === 'confirmed' ? 'Réservation confirmée' : 'Réservation annulée';
  const text = `
Bonjour,

Votre réservation du ${new Date(reservation.date).toLocaleDateString()} à ${reservation.time} pour ${reservation.numberOfPeople} personne(s) a été ${status === 'confirmed' ? 'confirmée' : 'annulée'}.

Merci de votre confiance.
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
  });
}