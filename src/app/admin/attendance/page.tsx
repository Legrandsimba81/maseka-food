"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";
import { Scan, LogIn, LogOut, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";

export default function ScanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [result, setResult] = useState<{ employee: any; type: string; status: "success" | "error" } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerRunningRef = useRef(false);
  const isMounted = useRef(true);
  const onScanSuccessRef = useRef<(decodedText: string) => void>(() => {});
  const startScannerRef = useRef<() => Promise<void>>(async () => {});

  // Définition de onScanSuccess
  const onScanSuccess = useCallback(async (decodedText: string) => {
    const qrCode = decodedText.trim();
    if (!qrCode) return;

    if (isProcessing || !scannerRunningRef.current) return;
    scannerRunningRef.current = false;

    if (scannerRef.current) {
      try {
        await scannerRef.current.pause();
        if (isMounted.current) setCameraActive(false);
      } catch {
        // ignore
      }
    }

    if (isMounted.current) setIsProcessing(true);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode,
          type,
          device: navigator.userAgent || "Web",
          ipAddress: "",
          location: "",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (isMounted.current) {
          setResult({ employee: data.employee, type: data.type, status: "success" });
          toast.success(`Pointage ${type === "entree" ? "entrée" : "sortie"} enregistré`);
        }
      } else {
        if (isMounted.current) {
          setResult({ employee: null, type: "", status: "error" });
          toast.error(data.error || "Erreur");
        }
      }
    } catch {
      if (isMounted.current) {
        toast.error("Erreur réseau");
        setResult({ employee: null, type: "", status: "error" });
      }
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }

    // Réinitialiser et reprendre le scan après 3 secondes
    setTimeout(async () => {
      if (!isMounted.current) return;
      setResult(null);
      scannerRunningRef.current = true;
      if (scannerRef.current) {
        try {
          await scannerRef.current.resume();
          if (isMounted.current) setCameraActive(true);
        } catch {
          // Si la reprise échoue, on redémarre complètement
          try {
            await scannerRef.current?.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 250 } },
              onScanSuccessRef.current,
              () => {}
            );
            if (isMounted.current) setCameraActive(true);
          } catch {
            scannerRef.current = null;
            await startScannerRef.current();
          }
        }
      } else {
        await startScannerRef.current();
      }
    }, 3000);
  }, [type, isProcessing]);

  // Définition de startScanner
  const startScanner = useCallback(async () => {
    if (scannerRef.current || scannerRunningRef.current) return;

    try {
      const scanner = new Html5Qrcode("qr-camera-feed");
      scannerRef.current = scanner;
      const config = { fps: 10, qrbox: { width: 250, height: 250 } };
      await scanner.start(
        { facingMode: "environment" },
        config,
        onScanSuccessRef.current,
        () => {}
      );
      scannerRunningRef.current = true;
      if (isMounted.current) setCameraActive(true);
    } catch (err) {
      if (isMounted.current) {
        toast.error("Erreur d'accès à la caméra : " + err);
      }
    }
  }, []);

  // Mettre à jour les refs
  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
    startScannerRef.current = startScanner;
  }, [onScanSuccess, startScanner]);

  // Nettoyage
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (scannerRef.current && scannerRunningRef.current) {
        scannerRunningRef.current = false;
        scannerRef.current.stop().then(() => {
          scannerRef.current?.clear();
          scannerRef.current = null;
        }).catch(() => {
          scannerRef.current = null;
        });
      }
    };
  }, []);

  // Démarrage automatique
  useEffect(() => {
    startScanner();
  }, [startScanner]);

  if (!session || session.user.role !== "admin") {
    return <div className="text-center py-8 text-red-500">Accès refusé</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Pointage par QR Code</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Scannez le QR Code d’un employé pour enregistrer son pointage
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="flex gap-4 justify-center mb-6">
          <button
            onClick={() => setType("entree")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              type === "entree"
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <LogIn size={20} /> Arrivée
          </button>
          <button
            onClick={() => setType("sortie")}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition ${
              type === "sortie"
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            <LogOut size={20} /> Sortie
          </button>
        </div>

        <div className="relative">
          <div
            id="qr-camera-feed"
            className={`w-full max-w-sm mx-auto border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 min-h-[250px] transition-opacity ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {!cameraActive && !isProcessing && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <Scan size={48} className="mb-2" />
              <p>En attente du scan...</p>
              <p className="text-xs mt-1">Placez le QR Code devant la caméra</p>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
              <Loader2 size={48} className="animate-spin mb-2" />
              <p>Traitement en cours...</p>
            </div>
          )}
        </div>

        {!cameraActive && !isProcessing && !result && (
          <button
            onClick={startScanner}
            className="mt-4 w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition"
          >
            Activer la caméra
          </button>
        )}
      </div>

      {result && (
        <div
          className={`p-6 rounded-xl shadow-lg ${
            result.status === "success"
              ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800"
          }`}
        >
          {result.status === "success" && result.employee ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
                <span className="text-lg font-semibold text-green-700 dark:text-green-300">
                  Pointage {result.type === "entree" ? "entrée" : "sortie"} enregistré
                </span>
              </div>
              <div className="flex items-center gap-4">
                {result.employee.image ? (
                  <img
                    src={result.employee.image}
                    alt={result.employee.firstName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-2xl text-gray-600">
                    {result.employee.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg">
                    {result.employee.firstName} {result.employee.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {result.employee.position}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock size={14} />
                    <span>{new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600 dark:text-red-400" size={28} />
              <span className="text-lg font-semibold text-red-700 dark:text-red-300">
                Erreur lors du pointage
              </span>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Vérifiez le QR Code ou réessayez
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}