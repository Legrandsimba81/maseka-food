"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Award,
  Download,
  User,
  QrCode,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import Link from "next/link";

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
  _count: { attendances: number };
}

interface RankingItem {
  id: string;
  name: string;
  position: string;
  image: string | null;
  totalEntries: number;
  lateCount: number;
  onTimeCount: number;
  punctualityRate: number;
}

export default function AdminEmployeesPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    position: "",
    department: "",
    image: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [showRanking, setShowRanking] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchEmployees();
    fetchRanking();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const res = await fetch(`/api/admin/employees?${params.toString()}`);
    if (res.ok) setEmployees(await res.json());
    setLoading(false);
  };

  const fetchRanking = async () => {
    const res = await fetch("/api/admin/employees/ranking");
    if (res.ok) setRanking(await res.json());
  };

  const handleSearch = () => fetchEmployees();

  const deleteEmployee = async (id: string) => {
    if (!confirm("Supprimer cet employé ?")) return;
    const res = await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Employé supprimé");
      fetchEmployees();
      fetchRanking();
    } else toast.error("Erreur");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/employees/${editingId}` : "/api/admin/employees";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editingId ? "Employé modifié" : "Employé ajouté");
      setShowForm(false);
      setEditingId(null);
      setForm({ firstName: "", lastName: "", email: "", phone: "", position: "", department: "", image: "", isActive: true });
      fetchEmployees();
      fetchRanking();
    } else {
      toast.error("Erreur");
    }
    setSaving(false);
  };

  const editEmployee = (emp: Employee) => {
    setForm({
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email || "",
      phone: emp.phone || "",
      position: emp.position,
      department: emp.department || "",
      image: emp.image || "",
      isActive: emp.isActive,
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const generateQR = async (qrCode: string) => {
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const data = `${baseUrl}/admin/attendance?qr=${qrCode}`;
      const qr = await QRCode.toDataURL(data, { width: 200, margin: 2 });
      setQrDataUrl(qr);
    } catch {
      toast.error("Erreur génération QR");
    }
  };

  const openCardModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    generateQR(emp.qrCode);
    setShowCardModal(true);
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
      link.download = `carte-${selectedEmployee?.firstName}-${selectedEmployee?.lastName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      toast.error("Erreur téléchargement");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Employés</h1>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowRanking(!showRanking)}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <Award size={18} className="text-amber-500" />
            <span className="hidden sm:inline">{showRanking ? "Masquer" : "Classement"}</span>
            {showRanking ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                position: "",
                department: "",
                image: "",
                isActive: true,
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition"
          >
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      {/* Classement */}
      {showRanking && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Award size={20} className="text-amber-500" /> Classement ponctualité
            </h2>
            <p className="text-sm text-gray-400">Basé sur les entrées (retard &gt; 8h00)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Employé</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Entrées</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">À l'heure</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Retards</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Ponctualité</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <span className="font-medium text-gray-400 w-5">{idx + 1}.</span>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-600 dark:text-gray-300">
                          {item.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-gray-400 ml-1">({item.position})</span>
                    </td>
                    <td className="px-4 py-2">{item.totalEntries}</td>
                    <td className="px-4 py-2 text-green-600 dark:text-green-400">{item.onTimeCount}</td>
                    <td className="px-4 py-2 text-red-600 dark:text-red-400">{item.lateCount}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          item.punctualityRate >= 90
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : item.punctualityRate >= 70
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {item.punctualityRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recherche */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un employé..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition">
            Rechercher
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Modifier" : "Ajouter"} un employé</h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Prénom *</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nom *</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Poste *</label>
              <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Département</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload label="Photo" onUpload={(url) => setForm({ ...form, image: url })} onRemove={() => setForm({ ...form, image: "" })} currentImage={form.image} />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label className="text-sm">Actif</label>
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des employés */}
      {loading ? (
        <p className="text-center py-8 text-gray-500">Chargement...</p>
      ) : employees.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Aucun employé trouvé.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition p-4 flex flex-col items-start"
            >
              <div className="flex items-center gap-3 w-full">
                {emp.image ? (
                  <img src={emp.image} alt={emp.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600" />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg font-medium text-gray-500 dark:text-gray-300">
                    {emp.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">
                    {emp.firstName} {emp.lastName}
                  </h3>
                  <p className="text-sm text-red-600 dark:text-red-400">{emp.position}</p>
                  {emp.department && <p className="text-xs text-gray-400 truncate">{emp.department}</p>}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 mt-3 w-full">
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    emp.isActive
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {emp.isActive ? "Actif" : "Inactif"}
                </span>
                <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                  {emp._count.attendances} pointages
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(emp.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mt-3 w-full border-t border-gray-100 dark:border-gray-700 pt-3">
                <button
                  onClick={() => editEmployee(emp)}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
                  title="Modifier"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deleteEmployee(emp.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
                <button
                  onClick={() => openCardModal(emp)}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  title="Carte de service"
                >
                  <QrCode size={16} />
                </button>
                <Link
                  href={`/admin/employees/${emp.id}/card`}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition ml-auto"
                  title="Voir carte"
                >
                  <User size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal carte de service */}
      {showCardModal && selectedEmployee && qrDataUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setShowCardModal(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <div ref={cardRef} className="w-full bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-red-600 text-white px-4 py-3 flex justify-between items-center">
                <span className="font-bold text-lg">MASEKA FOOD</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded">SERVICE</span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 bg-red-50 dark:bg-red-900/20 p-4 flex flex-col items-center justify-center">
                  {selectedEmployee.image ? (
                    <img
                      src={selectedEmployee.image}
                      alt={selectedEmployee.firstName}
                      className="w-28 h-28 rounded-full object-cover border-2 border-red-600 shadow"
                    />
                  ) : (
                    <div className="w-28 h-28 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-5xl text-gray-500">
                      {selectedEmployee.firstName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="sm:w-2/3 p-4 space-y-1">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedEmployee.firstName} {selectedEmployee.lastName}
                  </h2>
                  <p className="text-red-600 dark:text-red-400 font-semibold">{selectedEmployee.position}</p>
                  {selectedEmployee.department && <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.department}</p>}
                  {selectedEmployee.email && <p className="text-sm text-gray-500 dark:text-gray-400">📧 {selectedEmployee.email}</p>}
                  {selectedEmployee.phone && <p className="text-sm text-gray-500 dark:text-gray-400">📱 {selectedEmployee.phone}</p>}
                  <div className="flex justify-start mt-2">
                    <img src={qrDataUrl} alt="QR" className="w-24 h-24" />
                  </div>
                  <p className="text-xs text-gray-400">ID: {selectedEmployee.qrCode}</p>
                </div>
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 text-center text-xs text-gray-500 dark:text-gray-400 py-1 border-t border-gray-200 dark:border-gray-600">
                Présentez ce QR à l'entrée
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={downloadCard} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Download size={16} /> Télécharger
              </button>
              <button onClick={() => setShowCardModal(false)} className="btn-secondary flex-1">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}