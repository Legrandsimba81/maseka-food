"use client";
import { useState } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

export default function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(title + " - " + url)}`, "_blank");
    setShowMenu(false);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({ title, url });
    } else {
      handleCopy();
    }
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1 hover:text-primary"
      >
        <Share2 size={16} /> Partager
      </button>
      {showMenu && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border z-10">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />} Copier le lien
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            <MessageCircle size={16} /> WhatsApp
          </button>
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
          >
            <Share2 size={16} /> Autres applications
          </button>
        </div>
      )}
    </div>
  );
}