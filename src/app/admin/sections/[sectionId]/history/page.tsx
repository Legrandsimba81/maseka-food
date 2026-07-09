"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

export default function SectionHistory() {
  const { data: session } = useSession();
  const params = useParams();
  const sectionId = params.sectionId as string;

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyDetail, setDailyDetail] = useState(null);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchHistory();
    }
  }, [session, selectedDate]);

  const fetchHistory = async () => {
    setLoading(true);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const res = await fetch(`/api/admin/sections/${sectionId}/history?date=${dateStr}`);
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history);
      setDailyDetail(data.detail);
    } else {
      toast.error("Erreur chargement historique");
    }
    setLoading(false);
  };

  const changeDay = (offset) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + offset);
    setSelectedDate(newDate);
  };

  if (!session || session.user.role !== "admin") {
    return <div className="p-6 text-center text-red-500">Accès refusé</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Historique des ventes</h1>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => changeDay(-1)} className="p-2 rounded hover:bg-gray-100"><ChevronLeft size={20} /></button>
        <span className="font-semibold">{selectedDate.toLocaleDateString('fr-FR')}</span>
        <button onClick={() => changeDay(1)} className="p-2 rounded hover:bg-gray-100"><ChevronRight size={20} /></button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : dailyDetail ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-bold mb-4">Rapport du {selectedDate.toLocaleDateString('fr-FR')}</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Produit</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Quantité</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Prix</th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dailyDetail.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2">{item.product.name}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">{item.priceAtSale.toFixed(2)} $</td>
                    <td className="px-4 py-2 font-bold">{item.total.toFixed(2)} $</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 dark:bg-gray-700 font-bold">
                  <td colSpan={3} className="px-4 py-2 text-right">TOTAL</td>
                  <td className="px-4 py-2 text-lg text-green-600">{dailyDetail.totalAmount.toFixed(2)} $</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-center py-8 text-gray-500">Aucun rapport pour cette journée.</p>
      )}
    </div>
  );
}