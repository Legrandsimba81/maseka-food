"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; avatarUrl?: string | null };
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    const res = await fetch(`/api/products/${productId}/reviews`);
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
      // Vérifier si l’utilisateur a déjà un avis
      if (session?.user) {
        const myReview = data.find((r: any) => r.user.name === session.user.name);
        if (myReview) {
          setUserReview(myReview);
          setRating(myReview.rating);
          setComment(myReview.comment || "");
        }
      }
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Connectez‑vous pour laisser un avis");
      return;
    }
    setSubmitting(true);
    const res = await fetch(`/api/products/${productId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    if (res.ok) {
      toast.success(userReview ? "Avis mis à jour" : "Avis ajouté");
      fetchReviews();
    } else {
      toast.error("Erreur");
    }
    setSubmitting(false);
  };

  if (loading) return <div className="mt-8 text-center text-gray-500">Chargement des avis...</div>;

  return (
    <div className="mt-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Avis clients</h2>

      {/* Formulaire */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-semibold mb-3">
          {userReview ? "Modifier votre avis" : "Donnez votre avis"}
        </h3>
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
                  <Star size={28} fill={star <= rating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Commentaire (optionnel)</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input-field"
              placeholder="Partagez votre expérience..."
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Envoi..." : userReview ? "Mettre à jour" : "Publier"}
          </button>
        </form>
      </div>

      {/* Liste des avis */}
      {reviews.length === 0 ? (
        <p className="text-gray-500">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {review.user.avatarUrl ? (
                    <img
                      src={review.user.avatarUrl}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-600">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{review.user.name}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-0.5 text-yellow-500 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  {review.comment && <p className="mt-2 text-gray-700 dark:text-gray-300">{review.comment}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}