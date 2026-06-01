"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react"; // ou une icône SVG simple

export default function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.back()} className="flex items-center gap-1 text-amber-600 hover:text-amber-800 transition">
      <ArrowLeft size={20} /> Retour
    </button>
  );
}