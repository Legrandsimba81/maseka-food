"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Html5Qrcode } from "html5-qrcode";

export default function ScanPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [type, setType] = useState<"entree" | "sortie">("entree");
  const [result, setResult] = useState<{ employee: any; type: string } | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
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
    const url = new URL(decodedText);
    const token = url.searchParams.get("token");
    if (!token) {
      toast.error("QR Code invalide");
      return;
    }

    // Arrêter le scan pendant le traitement
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setScanning(false);
    }

    try {
      const res = await fetch("/api/admin/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type,
          deviceInfo: navigator.userAgent,
          ipAddress: "", // sera ajouté côté serveur ou via IP publique
          location: "", // optionnel, via geolocation API
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ employee: data.employee, type: data.type });
        toast.success(`Pointage ${type} enregistré pour ${data.employee.firstName} ${data.employee.lastName}`);
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    }

    // Réinitialiser pour un nouveau scan
    setTimeout(() => {
      setResult(null);
      if (scannerRef.current) {
        scannerRef.current.start({ facingMode: "environment" }, { fps: 10, qrbox: { width: 250, height: 250 } }, onScanSuccess, onScanError);
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
      <h1 className="text-2xl font-bold mb-4">Pointage par QR Code</h1>
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setType("entree")}
          className={`btn-primary ${type === "entree" ? "bg-green-600" : ""}`}
        >
          🟢 Entrée
        </button>
        <button
          onClick={() => setType("sortie")}
          className={`btn-primary ${type === "sortie" ? "bg-red-600" : ""}`}
        >
          🔴 Sortie
        </button>
      </div>

      <div id="reader" className="w-full max-w-md mx-auto border rounded-lg overflow-hidden"></div>

      {result && (
        <div className="mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
          <p className="font-semibold">{result.employee.firstName} {result.employee.lastName}</p>
          <p>Pointage : {result.type === "entree" ? "✅ Entrée" : "❌ Sortie"}</p>
          <p className="text-sm text-gray-600">Poste : {result.employee.position}</p>
        </div>
      )}
    </div>
  );
}