"use client";
import { useState } from "react";
import { X } from "lucide-react";

export default function PopupImage({ src, alt }: { src: string; alt: string }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!src) return null;

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="w-full h-auto rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-[1.01]"
        onClick={() => setIsOpen(true)}
      />
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div className="relative max-w-5xl w-full">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <img src={src} alt={alt} className="w-full h-auto max-h-[90vh] object-contain rounded-lg" />
          </div>
        </div>
      )}
    </>
  );
}