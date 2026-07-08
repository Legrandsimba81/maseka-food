"use client";

import { useState, useRef, useEffect } from "react";
import { Share2,  MessageCircle, Link2 } from "lucide-react";
import toast from "react-hot-toast";
import { FaFacebook } from "react-icons/fa";

interface ShareButtonProps {
  title: string;
  url: string;
  description?: string;
}

export default function ShareButton({ title, url, description = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shareUrls = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title}\n${description}\n${url}`)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch {
      toast.error("Erreur de copie");
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        aria-label="Partager"
      >
        <Share2 size={18} />
        <span>Partager</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <button
            onClick={() => {
              window.open(shareUrls.whatsapp, "_blank");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <MessageCircle size={18} className="text-green-500" />
            WhatsApp
          </button>
          <button
            onClick={() => {
              window.open(shareUrls.facebook, "_blank");
              setIsOpen(false);
            }}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <FaFacebook size={18} className="text-blue-600" />
            Facebook
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <Link2 size={18} className="text-gray-500" />
            Copier le lien
          </button>
        </div>
      )}
    </div>
  );
}