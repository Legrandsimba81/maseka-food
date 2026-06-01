"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Reservation {
  id: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests: string | null;
  status: string;
  adminNote?: string | null;
  user: { name: string; email: string };
}

export default function AdminReservationsPage() {
  const { data: session, status } = useSession();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterName, setFilterName] = useState("");
  const [noteInput, setNoteInput] = useState<{ [key: string]: string }>({});

  const fetchReservations = async (userName: string = "") => {
    setLoading(true);
    const url = userName ? `/api/admin/reservations?userName=${encodeURIComponent(userName)}` : "/api/admin/reservations";
    const res = await fetch(url);
    if (res.ok) setReservations(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") fetchReservations();
  }, [session, status]);

  const handleSearch = () => { setFilterName(searchTerm); fetchReservations(searchTerm); };
  const handleReset = () => { setSearchTerm(""); setFilterName(""); fetchReservations(""); };

  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast.success(`Réservation ${newStatus === "confirmed" ? "confirmée" : "annulée"}`);
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  const sendNote = async (id: string) => {
    const note = noteInput[id];
    if (!note) return;
    const res = await fetch(`/api/admin/reservations/${id}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: note }),
    });
    if (res.ok) {
      toast.success("Note envoyée");
      setNoteInput({ ...noteInput, [id]: "" });
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Supprimer définitivement cette réservation ?")) return;
    const res = await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Réservation supprimée");
      fetchReservations(filterName);
    } else toast.error("Erreur suppression");
  };

  if (status !== "authenticated" || session?.user?.role !== "admin") return <div className="text-center py-8">Accès refusé</div>;
  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Gestion des réservations</h1>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nom de l'utilisateur"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-64"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary">Rechercher</button>
          <button onClick={handleReset} className="btn-secondary">Réinitialiser</button>
        </div>
      </div>
      {reservations.length === 0 ? (
        <p>Aucune réservation.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div key={res.id} className="card p-4 border rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{res.user.name}</p>
                  <p className="text-sm text-gray-500">{res.user.email}</p>
                  <p className="text-sm">Date : {new Date(res.date).toLocaleDateString()} à {res.time}</p>
                  <p className="text-sm">Personnes : {res.numberOfPeople}</p>
                  {res.specialRequests && <p className="text-sm italic">Demande : {res.specialRequests}</p>}
                  {res.adminNote && <p className="text-sm text-gray-500">Note admin : {res.adminNote}</p>}
                </div>
                <div>
                  <span className={`text-xs px-2 py-1 rounded-full ${res.status === "pending" ? "bg-yellow-100 text-yellow-800" : res.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {res.status === "pending" ? "En attente" : res.status === "confirmed" ? "Confirmée" : "Annulée"}
                  </span>
                </div>
              </div>
              {res.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateStatus(res.id, "confirmed")} className="btn-primary text-sm py-1">Confirmer</button>
                  <button onClick={() => updateStatus(res.id, "cancelled")} className="btn-secondary bg-red-600 text-white text-sm py-1">Annuler</button>
                </div>
              )}
              <div className="mt-3">
                <textarea
                  className="input-field text-sm w-full"
                  rows={2}
                  placeholder="Ajouter une note"
                  value={noteInput[res.id] || ""}
                  onChange={(e) => setNoteInput({ ...noteInput, [res.id]: e.target.value })}
                />
                <div className="flex gap-2 mt-2">
                  <button onClick={() => sendNote(res.id)} className="btn-secondary text-sm py-1 flex-1">Envoyer note</button>
                  <button onClick={() => deleteReservation(res.id)} className="btn-secondary bg-red-600 text-white text-sm py-1 flex-1">Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}