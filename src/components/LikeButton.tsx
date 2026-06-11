"use client";
import { useState } from "react";
import { Heart } from "lucide-react";

export default function LikeButton({ slug, initialLikes }: { slug: string; initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    const res = await fetch(`/api/articles/${slug}/like`, { method: "POST" });
    const data = await res.json();
    setLikes(data.likes);
  };

  return (
    <button onClick={handleLike} className="flex items-center gap-2 text-red-500 hover:text-red-600">
      <Heart fill={liked ? "currentColor" : "none"} /> {likes} j'aime
    </button>
  );
}