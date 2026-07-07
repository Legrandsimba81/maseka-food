"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { Scan, CheckCircle, Clock, User, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function AttendanceScanPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrParam = searchParams.get("qr");

  const [qrCode, setQrCode] = useState(qrParam || "");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [type, setType] = useState<"entree" | "sortie">("entree");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.role !== "admin") router.push("/");
  }, [session, status, router]);

  // Si un QR est passé en paramètre, on le traite automatiquement
  useEffect(() => {
    if (qrParam && session?.user?.role === "admin") {
      setQrCode(qrParam);
      handleScan(qrParam);
    }
  }, [qrParam, session]);

  const handleScan = async (code?: string) => {
    const qrToScan = code || qrCode;
    if (!qrToScan) {
      toast.error("QR Code requis");
      return;
    }
    setScanning(true);
    try {
      const res = await fetch("/api/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCode: qrToScan,
          type,
          device: navigator.userAgent || "Web",
          ipAddress: "auto",
          location: null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
        toast.success(`${data.employee.name} - ${type === "entree" ? "Arrivée" : "Sortie"} enregistrée`);
      } else {
        toast.error(data.error || "Erreur");
      }
    } catch (err) {
      toast.error("Erreur réseau");
    } finally {
      setScanning(false);
    }
  };

  if (status === "loading") return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={18} /> Retour
      </button>

      <h1 className="text-2xl font-bold mb-6 text-center">Pointage des employés</h1>

      {result ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 p-6 text-center">
          <CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-4 mb-4">
            {result.employee.image ? (
              <img src={result.employee.image} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl">
                {result.employee.name.charAt(0)}
              </div>
            )}
            <div className="text-left">
              <p className="text-xl font-bold">{result.employee.name}</p>
              <p className="text-gray-500">{result.employee.position}</p>
            </div>
          </div>
          <p className="text-lg">
            <Clock className="inline mr-2" size={18} />
            {type === "entree" ? "Arrivée" : "Sortie"} enregistrée à {new Date(result.attendance.timestamp).toLocaleTimeString()}
          </p>
          <button
            onClick={() => { setResult(null); setQrCode(""); }}
            className="btn-primary mt-4"
          >
            Scanner un autre employé
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-center mb-6">
            <div className="border-4 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
              <Scan className="text-gray-400 w-16 h-16 mx-auto mb-2" />
              <p className="text-gray-500">Entrez le QR Code manuellement</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Code QR de l'employé</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrCode}
                  onChange={(e) => setQrCode(e.target.value)}
                  placeholder="Ex: 1A2B3C4D"
                  className="input-field flex-1"
                  disabled={scanning}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Type de pointage</label>
              <div className="flex gap-4">
                <button
                  onClick={() => setType("entree")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    type === "entree"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Arrivée
                </button>
                <button
                  onClick={() => setType("sortie")}
                  className={`flex-1 py-2 rounded-lg font-medium transition ${
                    type === "sortie"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Sortie
                </button>
              </div>
            </div>

            <button
              onClick={() => handleScan()}
              disabled={scanning || !qrCode}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {scanning ? "Traitement..." : <><Scan size={18} /> Scanner</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}