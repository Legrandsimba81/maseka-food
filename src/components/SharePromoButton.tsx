"use client";
import { useState } from "react";
import { Share2, MessageCircle, Link2 } from "lucide-react";
import { FaFacebook } from "react-icons/fa";
import toast from "react-hot-toast";

interface SharePromoButtonProps {
  title: string;
  description: string;
  url: string;
}

export default function SharePromoButton({ title, description, url }: SharePromoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShare = (platform: string) => {
    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`, "_blank");
    } else if (platform === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    } else if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-3 rounded-xl shadow-lg transition hover:shadow-xl text-lg"
      >
        <Share2 size={24} /> Partager la promo
      </button>
      {isOpen && (
        <div className="absolute left-0 mt-3 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
          <button
            onClick={() => handleShare("whatsapp")}
            className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <MessageCircle size={22} className="text-green-500" />
            <span className="font-medium">WhatsApp</span>
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FaFacebook size={22} className="text-blue-600" />
            <span className="font-medium">Facebook</span>
          </button>
          <button
            onClick={() => handleShare("copy")}
            className="flex items-center gap-3 w-full px-5 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Link2 size={22} className="text-gray-500" />
            <span className="font-medium">Copier le lien</span>
          </button>
        </div>
      )}
    </div>
  );
}