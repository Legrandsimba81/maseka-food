"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex font-bold justify-center bg-orange-100 hover:bg-orange-200 dark:bg-gray-500 dark:hover:bg-gray-600 dark:text-gray-100 items-center text-orange-700  transition rounded-full p-1 mb-4"
    >
      <ChevronLeft size={30} />
    </button>
  );
}