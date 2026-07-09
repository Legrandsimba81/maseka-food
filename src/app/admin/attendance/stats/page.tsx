"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Calendar, User, CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface EmployeeStats {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  image: string | null;
  totalDays: number;
  presenceDays: number;
  absenceDays: number;
  presenceRate: number;
}

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export default function AttendanceStatsPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<EmployeeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchStats = async () => {
    setLoading(true);
    const res = await fetch(`/api/attendance/stats?month=${month}&year=${year}`);
    if (res.ok) {
      const data = await res.json();
      setStats(data);
    } else {
      toast.error("Erreur chargement des statistiques");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchStats();
    }
  }, [session, month, year]);

  if (!session || session.user.role !== "admin") {
    return <div className="text-center py-8 text-red-500">Accès refusé</div>;
  }

  const totalEmployees = stats.length;
  const totalPresence = stats.reduce((sum, s) => sum + s.presenceDays, 0);
  const totalAbsence = stats.reduce((sum, s) => sum + s.absenceDays, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* En-tête et filtres */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Statistiques de présence</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="input-field w-36 sm:w-40"
          >
            {monthNames.map((name, i) => (
              <option key={i} value={i}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="input-field w-20 sm:w-24"
          />
          <button onClick={fetchStats} className="btn-primary text-sm px-4 py-2">
            Actualiser
          </button>
        </div>
      </div>

      {/* Cartes récapitulatives avec fond coloré à faible opacité */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow p-5 flex items-center gap-4 transition hover:shadow-md">
          <User className="text-blue-600 dark:text-blue-400" size={28} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employés</p>
            <p className="text-2xl font-bold">{totalEmployees}</p>
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg shadow p-5 flex items-center gap-4 transition hover:shadow-md">
          <CheckCircle className="text-green-600 dark:text-green-400" size={28} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Présences totales</p>
            <p className="text-2xl font-bold">{totalPresence}</p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow p-5 flex items-center gap-4 transition hover:shadow-md">
          <XCircle className="text-red-600 dark:text-red-400" size={28} />
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Absences totales</p>
            <p className="text-2xl font-bold">{totalAbsence}</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      {loading ? (
        <p className="text-center py-8 text-gray-500">Chargement...</p>
      ) : stats.length === 0 ? (
        <p className="text-center py-8 text-gray-500">Aucun employé.</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Employé</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Jours</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Présences</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Absences</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-300">Taux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {stats.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3 flex items-center gap-3">
                    {emp.image ? (
                      <img src={emp.image} alt={emp.firstName} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                        {emp.firstName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{emp.position}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{emp.totalDays}</td>
                  <td className="px-4 py-3 text-green-600 dark:text-green-400">{emp.presenceDays}</td>
                  <td className="px-4 py-3 text-red-600 dark:text-red-400">{emp.absenceDays}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      emp.presenceRate >= 90
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : emp.presenceRate >= 70
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {emp.presenceRate}%
                    </span>
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