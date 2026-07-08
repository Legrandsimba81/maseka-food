"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string; email: string; avatarUrl?: string | null } | null;
  product: { name: string } | null;
}

export default function AdminReviewsPage() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      } else {
        toast.error("Erreur chargement");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const deleteReview = async (id: string) => {
    if (!confirm("Supprimer cet avis ?")) return;
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success("Avis supprimé");
        fetchReviews();
      } else {
        toast.error("Erreur");
      }
    } catch {
      toast.error("Erreur réseau");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Avis sur les produits</h1>
      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : reviews.length === 0 ? (
        <p className="text-center py-8">Aucun avis</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {review.user?.name || "Utilisateur inconnu"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {review.user?.email || "Email inconnu"}
                  </p>
                  <p className="text-sm text-gray-400">
                    Produit : {review.product?.name || "Produit supprimé"}
                  </p>
                  <div className="flex items-center gap-1 text-yellow-500 my-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < review.rating ? "⭐" : "☆"}</span>
                    ))}
                  </div>
                  {review.comment && (
                    <p className="text-gray-700 dark:text-gray-300 mt-1">{review.comment}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}