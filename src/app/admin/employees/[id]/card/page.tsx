"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Download, QrCode, ArrowLeft } from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string | null;
  qrCode: string;
  image: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function EmployeeCardPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchEmployee();
  }, [id, session]);

  const fetchEmployee = async () => {
    try {
      const res = await fetch(`/api/admin/employees/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEmployee(data);
        // Générer le QR
        const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
        const qrData = `${baseUrl}/admin/attendance?qr=${data.qrCode}`;
        const qr = await QRCode.toDataURL(qrData, { width: 250, margin: 2, color: { dark: "#000", light: "#fff" } });
        setQrDataUrl(qr);
      } else {
        toast.error("Employé non trouvé");
        router.push("/admin/employees");
      }
    } catch (err) {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const link = document.createElement("a");
      link.download = `carte-${employee?.firstName}-${employee?.lastName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      toast.error("Erreur téléchargement");
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `qr-${employee?.firstName}-${employee?.lastName}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (!employee) return <div className="text-center py-8">Employé non trouvé</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white mb-4"
        >
          <ArrowLeft size={20} /> Retour
        </button>

        <div className="flex flex-col items-center">
          {/* Carte de service rectangulaire (largeur > hauteur) */}
          <div
            ref={cardRef}
            className="w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl border-2 border-red-600"
            style={{ aspectRatio: "16/9" }}
          >
            {/* En-tête rouge */}
            <div className="bg-red-600 text-white px-6 py-3 flex justify-between items-center">
              <span className="font-bold text-xl">MASEKA FOOD</span>
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full">SERVICE CARD</span>
            </div>

            {/* Corps de la carte (image à gauche, infos à droite) */}
            <div className="flex h-full">
              {/* Partie gauche : photo + QR */}
              <div className="w-2/5 bg-red-50 p-6 flex flex-col items-center justify-center gap-3">
                {employee.image ? (
                  <img
                    src={employee.image}
                    alt={employee.firstName}
                    className="w-32 h-32 object-cover rounded-lg border-2 border-red-600 shadow"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-5xl text-gray-500">
                    {employee.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Code" className="w-24 h-24" />
                )}
              </div>

              {/* Partie droite : informations */}
              <div className="w-3/5 p-6 flex flex-col justify-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-800">
                  {employee.firstName} {employee.lastName}
                </h2>
                <p className="text-red-600 font-semibold text-lg">{employee.position}</p>
                {employee.department && (
                  <p className="text-sm text-gray-600">{employee.department}</p>
                )}
                {employee.email && (
                  <p className="text-sm text-gray-600">📧 {employee.email}</p>
                )}
                {employee.phone && (
                  <p className="text-sm text-gray-600">📱 {employee.phone}</p>
                )}
                <p className="text-xs text-gray-400 mt-2">ID: {employee.qrCode}</p>
              </div>
            </div>

            {/* Pied de page */}
            <div className="bg-gray-100 text-center text-xs text-gray-500 py-1 border-t">
              Valable pour pointage – Présentez ce QR à l'entrée
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={downloadCard}
              className="btn-primary flex items-center gap-2 px-6 py-3"
            >
              <Download size={20} /> Télécharger la carte
            </button>
            <button
              onClick={downloadQR}
              className="btn-secondary flex items-center gap-2 px-6 py-3"
            >
              <QrCode size={20} /> Télécharger le QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}