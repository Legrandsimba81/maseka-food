"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Download, QrCode } from "lucide-react";

export default function AdminQrCodePage() {
  const { data: session } = useSession();
  const [qrMenu, setQrMenu] = useState<string | null>(null);
  const [qrApp, setQrApp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateQr = async (type: "menu" | "app") => {
    setLoading(true);
    const res = await fetch(`/api/qrcode/generate?type=${type}`);
    const data = await res.json();
    if (res.ok) {
      if (type === "menu") setQrMenu(data.qrCode);
      else setQrApp(data.qrCode);
    } else {
      alert(data.error);
    }
    setLoading(false);
  };

  const downloadQr = (qrDataURL: string, filename: string) => {
    const link = document.createElement("a");
    link.href = qrDataURL;
    link.download = filename;
    link.click();
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Génération de QR codes</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QR Menu */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-4">QR Code – Menu</h2>
          {qrMenu ? (
            <img src={qrMenu} alt="QR Code Menu" className="mx-auto mb-4 border rounded" />
          ) : (
            <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded mb-4">
              <QrCode size={48} className="text-gray-400" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => generateQr("menu")} disabled={loading} className="btn-primary">
              Générer
            </button>
            {qrMenu && (
              <button onClick={() => downloadQr(qrMenu, "qr-menu.png")} className="btn-secondary">
                <Download size={16} className="inline mr-1" /> Télécharger
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">Scannez ce QR pour accéder au menu des produits.</p>
        </div>

        {/* QR Application */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
          <h2 className="text-xl font-semibold mb-4">QR Code – Application</h2>
          {qrApp ? (
            <img src={qrApp} alt="QR Code Application" className="mx-auto mb-4 border rounded" />
          ) : (
            <div className="h-40 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded mb-4">
              <QrCode size={48} className="text-gray-400" />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => generateQr("app")} disabled={loading} className="btn-primary">
              Générer
            </button>
            {qrApp && (
              <button onClick={() => downloadQr(qrApp, "qr-app.png")} className="btn-secondary">
                <Download size={16} className="inline mr-1" /> Télécharger
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3">Scannez ce QR pour ouvrir l'application (ou le site).</p>
        </div>
      </div>
    </div>
  );
}