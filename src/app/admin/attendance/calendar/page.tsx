"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { User } from "lucide-react";

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  image: string | null;
}

interface DayStatus {
  date: string; // "YYYY-MM-DD"
  status: "present" | "absent";
}

const monthNames = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];
const dayNames = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export default function AttendanceCalendarPage() {
  const { data: session } = useSession();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [days, setDays] = useState<DayStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`/api/attendance/stats?month=${month}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        const empList = data.map((s: any) => ({
          id: s.id,
          firstName: s.firstName,
          lastName: s.lastName,
          position: s.position,
          image: s.image,
        }));
        setEmployees(empList);
        if (empList.length > 0 && !selectedEmployeeId) {
          setSelectedEmployeeId(empList[0].id);
        }
      } else {
        toast.error("Erreur chargement des employés");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  const fetchCalendar = async () => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/attendance/calendar?employeeId=${selectedEmployeeId}&month=${month}&year=${year}`
      );
      if (res.ok) {
        const data = await res.json();
        setDays(data.days || []);
      } else {
        toast.error("Erreur chargement du calendrier");
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchEmployees();
    }
  }, [session, month, year]);

  useEffect(() => {
    if (selectedEmployeeId) {
      fetchCalendar();
    }
  }, [selectedEmployeeId, month, year]);

  if (!session || session.user.role !== "admin") {
    return <div className="text-center py-8 text-red-500">Accès refusé</div>;
  }

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const offset = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;
  const totalDays = lastDayOfMonth.getDate();

  const calendarRows = [];
  let dayCounter = 1;
  for (let week = 0; week < 6; week++) {
    const row = [];
    for (let col = 0; col < 7; col++) {
      const index = week * 7 + col;
      if (index < offset || dayCounter > totalDays) {
        row.push(null);
      } else {
        row.push(dayCounter++);
      }
    }
    calendarRows.push(row);
    if (dayCounter > totalDays) break;
  }

  const getStatusForDate = (day: number): DayStatus | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return days.find(d => d.date === dateStr);
  };

  const getDayColor = (day: number, status?: DayStatus): string => {
    if (!status) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(year, month, day);
      if (checkDate > today) {
        return "bg-gray-100 dark:bg-gray-700";
      }
      return "bg-red-200 dark:bg-red-800";
    }
    if (status.status === "present") return "bg-green-200 dark:bg-green-800";
    return "bg-red-200 dark:bg-red-800";
  };

  const totalPresent = days.filter(d => d.status === "present").length;
  const totalAbsent = days.filter(d => d.status === "absent").length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Calendrier des présences</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="input-field w-48"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.firstName} {emp.lastName}
              </option>
            ))}
          </select>

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

          <button onClick={() => { fetchEmployees(); fetchCalendar(); }} className="btn-primary">
            Actualiser
          </button>
        </div>
      </div>

      {selectedEmployeeId && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <User size={24} className="text-blue-500" />
            <span className="font-medium">
              {employees.find(e => e.id === selectedEmployeeId)?.firstName}{" "}
              {employees.find(e => e.id === selectedEmployeeId)?.lastName}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Présences :</span>
            <span className="text-green-600 font-bold">{totalPresent}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Absences :</span>
            <span className="text-red-600 font-bold">{totalAbsent}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Taux :</span>
            <span className="font-bold">
              {totalPresent + totalAbsent > 0
                ? Math.round((totalPresent / (totalPresent + totalAbsent)) * 100)
                : 0}%
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-green-200 dark:bg-green-800 rounded"></span>
          Présent
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-red-200 dark:bg-red-800 rounded"></span>
          Absent
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-4 bg-gray-100 dark:bg-gray-700 rounded"></span>
          Futur
        </span>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <table className="w-full table-fixed">
            <thead>
              <tr>
                {dayNames.map((name) => (
                  <th key={name} className="py-2 text-center text-sm font-medium text-gray-500">
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calendarRows.map((week, weekIndex) => (
                <tr key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    if (day === null) {
                      return <td key={dayIndex} className="p-1"></td>;
                    }
                    const status = getStatusForDate(day);
                    const color = getDayColor(day, status);
                    return (
                      <td key={dayIndex} className="p-1 text-center">
                        <div className={`${color} rounded-lg p-2 text-sm font-medium transition-colors`}>
                          {day}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}