import { NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "menu"; // 'menu' ou 'app'

  let url = "";
  if (type === "menu") {
    url = `${process.env.NEXTAUTH_URL}/products`;
  } else if (type === "app") {
    // Pour l'application, utilisez un lien universel ou un schéma personnalisé
    // Exemple : 'https://maseka-food.vercel.app' ou 'masekafood://'
    url = `${process.env.NEXTAUTH_URL}`;
  } else {
    return NextResponse.json({ error: "Type invalide" }, { status: 400 });
  }

  try {
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    return NextResponse.json({ qrCode: qrCodeDataURL, url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur génération QR" }, { status: 500 });
  }
}