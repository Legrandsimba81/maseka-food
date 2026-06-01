"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ReservationStatusButton({ reservationId, newStatus, label, className }: {
  reservationId: string;
  newStatus: "confirmed" | "cancelled";
  label: string;
  className?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  const handleClick = async () => {
    setShowNoteModal(true);
  };

  const confirmAction = async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/reservations/${reservationId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, adminNote }),
    });
    if (res.ok) {
      toast.success(`Réservation ${label.toLowerCase()} avec succès`);
      router.refresh();
    } else {
      toast.error("Erreur");
    }
    setLoading(false);
    setShowNoteModal(false);
    setAdminNote("");
  };

  return (
    <>
      <button onClick={handleClick} disabled={loading} className={`px-3 py-1 text-white text-sm rounded ${className}`}>
        {loading ? "..." : label}
      </button>
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Ajouter une note (optionnel)</h3>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="input-field mb-4"
              rows={3}
              placeholder="Raison de l'annulation ou information supplémentaire..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNoteModal(false)} className="btn-secondary">Annuler</button>
              <button onClick={confirmAction} className="btn-primary">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}