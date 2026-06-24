"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Star, X } from "lucide-react";

export default function BakeryReviewPopup() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [lastAsked, setLastAsked] = useState<number | null>(null);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son avis
    if (session) {
      fetch("/api/bakery-reviews")
        .then(res => res.json())
        .then(data => {
          const myReview = data.find((r: any) => r.user.name === session.user.name);
          if (myReview) {
            setHasReviewed(true);
            setRating(myReview.rating);
            setComment(myReview.comment || "");
          }
        });
    }

    // Vérifier le dernier moment où le popup a été affiché
    const last = localStorage.getItem("bakery_review_last_asked");
    if (last) setLastAsked(parseInt(last));

    // Déclencher l'affichage après 30 secondes
    const timer = setTimeout(() => {
      if (!hasReviewed && session) {
        const now = Date.now();
        if (!lastAsked || (now - lastAsked) > 24 * 60 * 60 * 1000) { // 24h
          setIsOpen(true);
          localStorage.setItem("bakery_review_last_asked", now.toString());
        }
      }
    }, 30000); // 30 secondes

    return () => clearTimeout(timer);
  }, [session, hasReviewed, lastAsked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch("/api/bakery-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      toast.success("Merci pour votre avis !");
      setHasReviewed(true);
      setIsOpen(false);
    } else {
      toast.error("Erreur");
    }
    setSubmitting(false);
  };

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center mb-4">Donnez votre avis</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 text-sm mb-6">
          Comment évaluez-vous notre boulangerie ?
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Note</label>
            <div className="flex gap-1 justify-center">
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
            <label className="block text-sm font-medium mb-1">Commentaire</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field"
              placeholder="Votre expérience..."
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? "Envoi..." : hasReviewed ? "Mettre à jour" : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}