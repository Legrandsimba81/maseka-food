"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

interface Reservation {
  id: string;
  date: string;
  time: string;
  numberOfPeople: number;
  specialRequests: string | null;
  status: string;
  adminNote?: string | null;
}

export default function ReservationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      if (res.ok) {
        const data = await res.json();
        setReservations(data);
      }
    } catch (error) {
      toast.error("Erreur chargement réservations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) fetchReservations();
  }, [session, status]);

  if (status === "loading" || loading) return <div className="text-center py-8">Chargement...</div>;

  if (reservations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Mes réservations</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Aucune réservation pour le moment.</p>
        <Link href="/reservation" className="btn-primary">+ Réserver une table</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Mes réservations</h1>
        <Link href="/reservation" className="btn-primary text-center sm:w-auto">
          + Nouvelle réservation
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {reservations.map((res) => (
          <div key={res.id} className="card overflow-hidden">
            <div className="p-4 sm:p-5">
              <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Réservation #{res.id.slice(0,8)}
                  </p>
                  <p className="text-base sm:text-lg font-semibold">
                    {new Date(res.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {res.time} · {res.numberOfPeople} personne(s)
                  </p>
                  {res.specialRequests && (
                    <p className="text-xs sm:text-sm text-gray-500 italic mt-1">
                      Note : {res.specialRequests}
                    </p>
                  )}
                  {res.adminNote && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                       {res.adminNote}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                  res.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  res.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {res.status === "pending" ? "En attente" : res.status === "confirmed" ? "Confirmée" : "Annulée"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}