"use client";
import { Share2 } from "lucide-react";

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      navigator.clipboard.writeText(url);
      alert("Lien copié dans le presse-papiers");
    }
  };
  return (
    <button onClick={handleShare} className="flex items-center gap-1 hover:text-primary">
      <Share2 size={16} /> Partager
    </button>
  );
}