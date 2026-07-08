"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { User, Calendar, CheckCircle, XCircle, Eye } from "lucide-react";
import Link from "next/link";

interface EmployeeHistory {
  employeeId: string;
  firstName: string;
  lastName: string;
  position: string;
  image: string | null;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  presenceRate: number;
}

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function AttendanceHistoryPage() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<EmployeeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchHistory = async () => {
    setLoading(true);
    const res = await fetch(`/api/attendance/history?month=${month}&year=${year}`);
    if (res.ok) {
      const data = await res.json();
      setHistory(data);
    } else {
      toast.error("Erreur chargement de l'historique");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchHistory();
    }
  }, [session, month, year]);

  if (!session || session.user.role !== "admin") {
    return <div className="text-center py-8 text-red-500">Accès refusé</div>;
  }

  const totalEmployees = history.length;
  const totalPresent = history.reduce((sum, h) => sum + h.presentDays, 0);
  const totalAbsent = history.reduce((sum, h) => sum + h.absentDays, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Historique mensuel des présences</h1>
        <div className="flex gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input-field w-40"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-24"
          />
          <button onClick={fetchHistory} className="btn-primary">Actualiser</button>
        </div>
      </div>

      {/* Cartes récapitulatives */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3">
            <User size={24} className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Employés</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3">
            <CheckCircle size={24} className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Présences totales</p>
              <p className="text-2xl font-bold">{totalPresent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-l-4 border-red-500">
          <div className="flex items-center gap-3">
            <XCircle size={24} className="text-red-500" />
            <div>
              <p className="text-sm text-gray-500">Absences totales</p>
              <p className="text-2xl font-bold">{totalAbsent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <p>Chargement...</p>
      ) : history.length === 0 ? (
        <p>Aucun employé.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Total jours</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Présences</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Absences</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Taux</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {history.map((emp) => (
                <tr key={emp.employeeId}>
                  <td className="px-4 py-3 flex items-center gap-3">
                    {emp.image ? (
                      <img src={emp.image} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold">
                        {emp.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{emp.totalDays}</td>
                  <td className="px-4 py-3 text-green-600">{emp.presentDays}</td>
                  <td className="px-4 py-3 text-red-600">{emp.absentDays}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.presenceRate >= 90 ? "bg-green-100 text-green-800" :
                      emp.presenceRate >= 70 ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {emp.presenceRate}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/attendance/calendar?employeeId=${emp.employeeId}&month=${month}&year=${year}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={18} />
                      Voir détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}