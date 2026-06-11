"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

const gallery = [
  {
    src: "/images/about/family-table.jpg",
    title: "Table de famille",
    description: "Ambiance conviviale pour vos repas en groupe.",
  },
  {
    src: "/images/about/president-table.jpg",
    title: "Table présidentielle",
    description: "Confort et élégance pour vos réceptions privées.",
  },
  {
    src: "/images/about/reception.jpg",
    title: "Salle de réception",
    description: "Idéale pour vos anniversaires et cérémonies.",
  },
  {
    src: "/images/about/parking.jpg",
    title: "Parking privé",
    description: "Stationnement facile et sécurisé sur place.",
  },
];

export default function AboutSection() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string>("");

  const openModal = (src: string, title: string) => {
    setSelectedImage(src);
    setSelectedTitle(title);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setSelectedTitle("");
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Découvrez Maseka Food
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
            Un cadre chaleureux, moderne et adapté à toutes vos occasions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gallery.map((item, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer group"
              onClick={() => openModal(item.src, item.title)}
            >
              <div className="relative h-64 w-full">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white">{item.title}</h3>
                <p className="text-white/80 text-sm mt-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal d'image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative h-[70vh] w-full">
                <Image
                  src={selectedImage}
                  alt={selectedTitle}
                  fill
                  className="object-contain"
                />
              </div>
              {selectedTitle && (
                <div className="p-4 text-center">
                  <h3 className="text-xl font-semibold">{selectedTitle}</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}