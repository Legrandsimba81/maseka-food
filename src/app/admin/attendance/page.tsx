"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, LogIn, LogOut, CheckCircle, XCircle, User, Clock, Shield } from "lucide-react";

export default function ScanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [result, setResult] = useState<{ employee: any; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }

    const startScanner = async () => {
      if (!isMounted.current) return;
      if (scannerRef.current) {
        // Si le scanner existe déjà, on le nettoie d'abord
        try {
          await scannerRef.current.stop();
        } catch (e) {}
        scannerRef.current = null;
      }
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        await scanner.start({ facingMode: "environment" }, config, onScanSuccess, onScanError);
        if (isMounted.current) setScanning(true);
      } catch (err) {
        if (isMounted.current) {
          toast.error("Erreur caméra : " + err);
          setError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted.current = false;
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
        scannerRef.current = null;
      }
      // Nettoyer l'élément reader pour éviter les doublons
      const readerElement = document.getElementById("reader");
      if (readerElement) {
        // Supprimer les enfants créés par le scanner
        while (readerElement.firstChild) {
          readerElement.removeChild(readerElement.firstChild);
        }
      }
    };
  }, [session, router]);

  const onScanSuccess = async (decodedText: string) => {
    try {
      const url = new URL(decodedText);
      const qrCode = url.searchParams.get("qr");
      if (!qrCode) {
        toast.error("QR Code invalide");
        return;
      }

      if (scannerRef.current) {
        await scannerRef.current.stop();
        if (isMounted.current) setScanning(false);
      }

      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          type,
          deviceInfo: navigator.userAgent || "Web",
          ipAddress: "auto",
          location: null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (isMounted.current) {
          setResult({ employee: data.employee, type: data.type });
          toast.success(`✅ Pointage ${type === "entree" ? "entrée" : "sortie"} enregistré`);
        }
      } else {
        if (isMounted.current) {
          setError(data.error || "Erreur");
          toast.error(data.error || "Erreur");
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError("Erreur réseau ou QR invalide");
        toast.error("Erreur réseau");
      }
    }

    // Réinitialiser après 3 secondes
    setTimeout(() => {
      if (!isMounted.current) return;
      setResult(null);
      setError(null);
      if (scannerRef.current) {
        scannerRef.current
          .start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanError)
          .then(() => { if (isMounted.current) setScanning(true); })
          .catch(() => {});
      }
    }, 3000);
  };

  const onScanError = (err: any) => {
    // Ignorer les erreurs de scan (pas de QR détecté)
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Pointage par QR Code</h1>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex gap-3">
            <button
              onClick={() => setType("entree")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                type === "entree"
                  ? "bg-green-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <LogIn size={20} /> Entrée
            </button>
            <button
              onClick={() => setType("sortie")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition ${
                type === "sortie"
                  ? "bg-red-600 text-white shadow-md"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <LogOut size={20} /> Sortie
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-500">
            <Shield size={16} />
            <span>Scannez le QR Code de l'employé</span>
          </div>
          <div id="reader" className="w-full max-w-md mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-black/5"></div>
          {!scanning && !result && !error && (
            <p className="text-center text-sm text-gray-400 mt-3">Caméra en cours d'initialisation...</p>
          )}
        </div>

        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {result.type === "entree" ? "✅ Entrée enregistrée" : "❌ Sortie enregistrée"}
                </p>
                <p className="text-lg font-bold">
                  {result.employee.firstName} {result.employee.lastName}
                </p>
                <p className="text-sm text-gray-600">{result.employee.position}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <XCircle size={32} className="text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div>
                <p className="text-lg font-bold text-red-600">Erreur</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}