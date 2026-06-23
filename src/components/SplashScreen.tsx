"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500 px-4">
      <div className="animate-splash-logo flex flex-col items-center">
        <Image
          src="/images/favicon.icon.png"
          alt="Maseka Food"
          width={120}
          height={120}
          className="w-20 h-20 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 object-contain"
          priority
        />
        <p className="mt-3 sm:mt-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary dark:text-white text-center">
          maseka food
        </p>
        <p className="text-xs sm:text-sm md:text-base text-gray-500 dark:text-gray-400 text-center">
          Boulangerie & Pâtisserie
        </p>
      </div>
    </div>
  );
}