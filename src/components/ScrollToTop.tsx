"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 group focus:outline-none"
      aria-label="Retour en haut"
    >
      {/* Ondes radar */}
      <div className="absolute inset-0 rounded-full bg-primary/50 animate-ping-slow"></div>
      <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-slow"></div>

      {/* Cercle principal */}
      <div className="relative bg-primary hover:bg-primary-dark text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110">
        <ArrowUp size={24} strokeWidth={2.5} />
      </div>
    </button>
  );
}