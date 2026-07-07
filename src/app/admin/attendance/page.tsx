"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { Scan, User, Clock, CheckCircle, XCircle, AlertCircle, LogIn, LogOut } from "lucide-react";

export default function ScanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [result, setResult] = useState<{ employee: any; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }

    // Déterminer automatiquement le type selon l'heure
    const now = new Date();
    const hours = now.getHours();
    // Si l'heure est entre 5h et 12h -> entrée, sinon sortie
    if (hours >= 5 && hours < 12) {
      setType("entree");
    } else {
      setType("sortie");
    }

    const startScanner = async () => {
      if (scannerRef.current) return;
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        };
        await scanner.start(
          { facingMode: "environment" },
          config,
          onScanSuccess,
          onScanError
        );
        setScanning(true);
      } catch (err) {
        toast.error("Erreur caméra : " + err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [session, router]);

  const onScanSuccess = async (decodedText: string) => {
    // decodedText est l'URL contenant le token
    let qrCode = decodedText;
    try {
      const url = new URL(decodedText);
      const token = url.searchParams.get("qr") || url.searchParams.get("token");
      if (token) qrCode = token;
    } catch (e) {
      // si ce n'est pas une URL valide, on utilise le texte directement
      qrCode = decodedText;
    }

    if (!qrCode) {
      toast.error("QR Code invalide");
      return;
    }

    // Arrêter le scan pendant le traitement
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setScanning(false);
    }

    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          type,
          deviceInfo: navigator.userAgent || "Web",
          ipAddress: "",
          location: "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ employee: data.employee, type: data.type });
        setError(null);
        toast.success(`${type === "entree" ? "✅ Entrée" : "✅ Sortie"} enregistrée pour ${data.employee.firstName} ${data.employee.lastName}`);
      } else {
        setError(data.error || "Erreur");
        setResult(null);
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      setError("Erreur réseau");
      toast.error("Erreur réseau");
    }

    // Réinitialiser pour un nouveau scan après 3 secondes
    setTimeout(() => {
      setResult(null);
      setError(null);
      if (scannerRef.current) {
        scannerRef.current.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          onScanSuccess,
          onScanError
        );
        setScanning(true);
      }
    }, 3000);
  };

  const onScanError = (err: any) => {
    // ignore les erreurs de scan (pas de QR détecté)
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scan className="w-6 h-6" /> Pointage par QR Code
          </h1>
          <p className="text-sm opacity-90 mt-1">Scannez le QR Code d'un employé pour enregistrer son pointage</p>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setType("entree")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                type === "entree"
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <LogIn className="w-5 h-5" /> Entrée
            </button>
            <button
              onClick={() => setType("sortie")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                type === "sortie"
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <LogOut className="w-5 h-5" /> Sortie
            </button>
          </div>

          <div className="relative">
            <div id="reader" className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-900"></div>
            {!scanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-xl">
                <div className="text-center">
                  <Scan className="w-12 h-12 mx-auto mb-2 animate-pulse" />
                  <p>Prêt à scanner...</p>
                </div>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="font-semibold text-lg">
                    {result.employee.firstName} {result.employee.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {result.employee.position} • {result.type === "entree" ? "✅ Entrée" : "❌ Sortie"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <p className="font-semibold text-red-600 dark:text-red-300">Erreur</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}