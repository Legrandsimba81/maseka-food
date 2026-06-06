"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminReservationsPage() {
  const { data: session } = useSession();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterName, setFilterName] = useState("");
  const [noteInput, setNoteInput] = useState({});

  const fetchReservations = async (userName = "") => {
    setLoading(true);
    const url = userName ? `/api/admin/reservations?userName=${encodeURIComponent(userName)}` : "/api/admin/reservations";
    const res = await fetch(url);
    if (res.ok) setReservations(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    if (session?.user?.role === "admin") fetchReservations();
  }, [session, filterName]);

  const handleSearch = () => {
    setFilterName(searchTerm);
    fetchReservations(searchTerm);
  };
  const handleReset = () => {
    setSearchTerm("");
    setFilterName("");
    fetchReservations("");
  };

  const updateStatus = async (id, status, adminNote) => {
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    if (res.ok) {
      toast.success(`Réservation ${status === "confirmed" ? "confirmée" : "annulée"}`);
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  const sendNote = async (id) => {
    const note = noteInput[id];
    if (!note) return;
    const res = await fetch(`/api/admin/reservations/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: note }),
    });
    if (res.ok) {
      toast.success("Note envoyée");
      setNoteInput({ ...noteInput, [id]: "" });
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  const deleteReservation = async (id) => {
    if (!confirm("Supprimer définitivement cette réservation ?")) return;
    const res = await fetch(`/api/admin/reservations/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Réservation supprimée");
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  const deleteAllReservations = async () => {
    if (!confirm("⚠️ Supprimer TOUTES les réservations ? Action irréversible.")) return;
    const res = await fetch("/api/admin/reservations/delete-all", { method: "DELETE" });
    if (res.ok) {
      toast.success("Toutes les réservations supprimées");
      fetchReservations(filterName);
    } else toast.error("Erreur");
  };

  if (!session || session.user.role !== "admin") return <div className="p-6">Accès refusé</div>;
  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex flex-wrap justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des réservations</h1>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Nom client"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field w-64"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="btn-primary">Rechercher</button>
          <button onClick={handleReset} className="btn-secondary">Réinitialiser</button>
          <button onClick={deleteAllReservations} className="btn-secondary bg-red-600 text-white">Tout supprimer</button>
        </div>
      </div>
      {reservations.length === 0 ? (
        <p>Aucune réservation.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reservations.map((res) => (
            <div key={res.id} className="card p-4">
              <div className="flex flex-wrap justify-between items-start">
                <div>
                  {res.user ? (
                    <>
                      <p><strong>{res.user.name}</strong> ({res.user.email})</p>
                    </>
                  ) : (
                    <p><strong>⚠️ Utilisateur inconnu</strong> (compte supprimé)</p>
                  )}
                  <p>Date : {new Date(res.date).toLocaleDateString()} à {res.time}</p>
                  <p>Personnes : {res.numberOfPeople}</p>
                  {res.specialRequests && <p className="text-sm italic">Demande : {res.specialRequests}</p>}
                  {res.adminNote && <p className="text-sm text-muted-foreground">Note admin : {res.adminNote}</p>}
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    res.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    res.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {res.status === "pending" ? "En attente" : res.status === "confirmed" ? "Confirmée" : "Annulée"}
                  </span>
                </div>
              </div>
              {res.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updateStatus(res.id, "confirmed", noteInput[res.id])} className="btn-primary text-sm py-1">Confirmer</button>
                  <button onClick={() => updateStatus(res.id, "cancelled", noteInput[res.id])} className="btn-secondary bg-red-600 text-white text-sm py-1">Annuler</button>
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
                  <button onClick={() => sendNote(res.id)} className="btn-secondary flex-1">Envoyer note</button>
                  <button onClick={() => deleteReservation(res.id)} className="btn-secondary bg-red-600 text-white flex-1">Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}