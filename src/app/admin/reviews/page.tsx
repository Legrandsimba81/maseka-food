"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Star, Trash2 } from "lucide-react";

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const res = await fetch("/api/admin/reviews");
    if (res.ok) {
      setReviews(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Avis supprimé");
      fetchReviews();
    } else {
      toast.error("Erreur");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des avis</h1>
      {loading ? (
        <p>Chargement...</p>
      ) : reviews.length === 0 ? (
        <p>Aucun avis.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < review.rating ? "fill-amber-500 text-amber-500" : "text-gray-300"} />
                    ))}
                  </div>
                  <span className="font-medium">{review.user.name}</span>
                  <span className="text-sm text-gray-500">{review.product.name}</span>
                </div>
                {review.comment && <p className="mt-1">{review.comment}</p>}
                <p className="text-xs text-gray-400 mt-1">{new Date(review.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={() => deleteReview(review.id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}