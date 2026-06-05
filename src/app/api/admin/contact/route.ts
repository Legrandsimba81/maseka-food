import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";


export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 });
    }

    // Sauvegarde en base
    const contact = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    // Envoi d'email si configuré
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: `"${name}" <${email}>`,
        to: process.env.CONTACT_EMAIL || "contact@masekafood.com",
        subject: `[Contact] ${subject}`,
        text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<p><strong>Nom:</strong> ${name}</p>
               <p><strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>`,
      });
    } else {
      console.log("📧 Message de contact (sauvegardé en base seulement)");
    }

    return NextResponse.json({ success: true, id: contact.id });
  } catch (error) {
    console.error("Erreur API contact:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}