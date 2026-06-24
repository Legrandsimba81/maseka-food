"use client";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";

export default function BakeryReviewsList() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch("/api/bakery-reviews")
      .then(res => res.json())
      .then(data => setReviews(data));
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Ce que nos clients disent</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review: any) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-700 font-bold">
                  {review.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{review.user.name}</p>
                  <div className="flex gap-0.5 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                </div>
              </div>
              {review.comment && <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>}
              <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}