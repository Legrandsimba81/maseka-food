"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, Store, Calendar, Package } from "lucide-react";

export default function SectionsPage() {
  const { data: session } = useSession();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.role === "super_admin") {
      fetchSections();
    }
  }, [session]);

  const fetchSections = async () => {
    const res = await fetch("/api/admin/sections");
    if (res.ok) {
      setSections(await res.json());
    }
    setLoading(false);
  };

  if (!session || session.user.role !== "super_admin") {
    return <div className="p-6 text-center text-red-500">Accès refusé</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📋 Sections (points de vente)</h1>
        <Link href="/admin/sections/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Nouvelle section
        </Link>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : sections.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Aucune section créée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border p-6">
              <div className="flex items-center gap-2 mb-2">
                <Store size={20} className="text-orange-500" />
                <h2 className="text-xl font-bold">{section.name}</h2>
              </div>
              {section.description && <p className="text-sm text-gray-500 mb-2">{section.description}</p>}
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Package size={14} /> {section._count.products} produits</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> {section._count.dailySales} rapports</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/admin/sections/${section.id}`} className="btn-primary text-sm py-1 px-3">Dashboard</Link>
                <Link href={`/admin/sections/${section.id}/history`} className="btn-secondary text-sm py-1 px-3">Historique</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}