// src/components/PromoSlider.tsx
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import PromoCard from "./PromoCard";

interface PromoItem {
  imageSrc: string;
  title: string;
  productId?: string;
  description?: string;
}

interface PromoSliderProps {
  items: PromoItem[];
  autoScrollInterval?: number;
  pauseOnHover?: boolean;
}

export default function PromoSlider({
  items,
  autoScrollInterval = 5000,
  pauseOnHover = true,
}: PromoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const startAutoScroll = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isHovered && items.length > 0) {
        nextSlide();
      }
    }, autoScrollInterval);
  }, [isHovered, items.length, autoScrollInterval, nextSlide]);

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoScroll]);

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden"
      onMouseEnter={() => pauseOnHover && setIsHovered(true)}
      onMouseLeave={() => pauseOnHover && setIsHovered(false)}
    >
      {/* Conteneur des slides avec transition */}
      <div
        className="md:w-3/4 flex transition-transform duration-1000 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="w-full flex-shrink-0 flex justify-center px-4 sm:px-8"
          >
            <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl mx-auto">
              <PromoCard
                imageSrc={item.imageSrc}
                title={item.title}
                productId={item.productId}
                description={item.description}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Boutons de navigation (optionnels, mais améliorés) */}
      {/* <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-700 transition z-10"
        aria-label="Précédent"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-gray-800/80 rounded-full p-2 shadow-md hover:bg-white dark:hover:bg-gray-700 transition z-10"
        aria-label="Suivant"
      >
        ❯
      </button> */}

      {/* Dots de navigation */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              idx === currentIndex ? "bg-orange-600 w-5" : "bg-gray-400"
            }`}
            aria-label={`Aller à la slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}