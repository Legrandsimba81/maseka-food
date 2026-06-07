"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const [exchangeRate, setExchangeRate] = useState<number>(2300);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => setExchangeRate(data.exchangeRate || 2300));
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exchangeRate }),
    });
    if (res.ok) {
      toast.success("Taux de change mis à jour");
    } else {
      toast.error("Erreur");
    }
    setLoading(false);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Paramètres de la boulangerie</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Taux de change (Francs Congolais → Dollar US)
          </label>
          <input
            type="number"
            step="1"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(Number(e.target.value))}
            className="input-field"
          />
          <p className="text-sm text-muted-foreground mt-1">
            1 USD = {exchangeRate} FC
          </p>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary">
          {loading ? "Enregistrement..." : "Enregistrer"}
        </button>
      </div>
      <p>mot de passe base de donnees supabase : P4rP0oIPf9F2rlOA et bd neon : npg_WGtPU5InNxz2</p>
    </div>
  );
}