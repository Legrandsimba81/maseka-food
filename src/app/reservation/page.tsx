"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReservationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    numberOfPeople: 2,
    specialRequests: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (status !== "authenticated") {
      toast.error("Veuillez vous connecter");
      router.push("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Réservation envoyée ! Vous recevrez une confirmation.");
        setFormData({ date: "", time: "", numberOfPeople: 2, specialRequests: "" });
        // Redirection vers la liste des réservations après 1 seconde
        setTimeout(() => router.push("/reservations"), 1000);
      } else {
        toast.error(data.error || "Erreur lors de la réservation");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="container-custom py-8 max-w-2xl mx-auto dark:bg-gray-900">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title text-center">Réserver une table</h1>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Heure</label>
              <select
                name="time"
                required
                value={formData.time}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Sélectionnez une heure</option>
                {["12:00", "12:30", "13:00", "13:30", "19:00", "19:30", "20:00", "20:30"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de personnes</label>
              <input
                type="number"
                name="numberOfPeople"
                min="1"
                max="20"
                required
                value={formData.numberOfPeople}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Demandes spéciales (optionnel)</label>
              <textarea
                name="specialRequests"
                rows={3}
                value={formData.specialRequests}
                onChange={handleChange}
                className="input-field"
                placeholder="Allergies, préférences, etc."
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Envoi en cours..." : "Réserver"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}