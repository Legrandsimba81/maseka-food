"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";

export default function BakeryReviewModal() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son avis (via localStorage)
    const hasReviewed = localStorage.getItem("bakery_reviewed");
    if (hasReviewed) return;

    // Si l'utilisateur n'est pas connecté, on ne demande pas immédiatement
    if (status === "unauthenticated") return;

    // Si l'utilisateur est connecté, vérifier en base s'il a déjà avis
    if (session) {
      fetch("/api/bakery-reviews/user-status")
        .then((res) => res.json())
        .then((data) => {
          if (data.hasReviewed) {
            localStorage.setItem("bakery_reviewed", "true");
            return;
          }
          // Sinon, ouvrir la modale après 20 secondes
          const timer = setTimeout(() => {
            setIsOpen(true);
          }, 20000); // 20 secondes
          return () => clearTimeout(timer);
        });
    }
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Connectez‑vous pour donner votre avis");
      router.push("/login");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/bakery-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      toast.success("Merci pour votre avis !");
      localStorage.setItem("bakery_reviewed", "true");
      setIsOpen(false);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "Erreur");
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 relative shadow-xl">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-center">Donnez votre avis</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Votre avis nous aide à nous améliorer. Merci !
        </p>
        {!session ? (
          <div className="text-center">
            <p className="mb-4">Connectez‑vous pour laisser un avis.</p>
            <button onClick={() => router.push("/login")} className="btn-primary">
              Se connecter
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Note (1-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                      star <= rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"
                    }`}
                  >
                    <Star size={32} fill={star <= rating ? "currentColor" : "none"} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Votre message</label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="input-field"
                placeholder="Partagez votre expérience..."
              />
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Envoi..." : "Envoyer mon avis"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}