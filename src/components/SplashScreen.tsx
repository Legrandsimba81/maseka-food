"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2500); // 2,5 secondes

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500">
      <div className="animate-pulse">
        <Image
          src="/images/favicon.icon.png"
          alt="Maseka Food"
          width={120}
          height={120}
          className="drop-shadow-lg"
        />
        <p className="mt-4 text-xl font-bold text-primary dark:text-white text-center">
          maseka food
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Boulangerie & Pâtisserie
        </p>
      </div>
    </div>
  );
}