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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500">
      <div className="animate-splash-logo">
        <Image
          src="/images/favicon.icon.png"
          alt="Maseka Food"
          width={120}
          height={120}
          className="w-24 h-24 md:w-32 md:h-32 object-contain"
          priority
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