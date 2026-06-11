// src/components/ServicesSection.tsx
"use client";
import { Wifi, HandshakeIcon, Clock, Shield, Truck, Heart } from "lucide-react";

const services = [
  {
    icon: Wifi,
    title: "Connexion Wi-Fi gratuite",
    description: "Profitez de notre Wi-Fi haut débit gratuit pendant votre visite.",
  },
  {
    icon: HandshakeIcon,
    title: "Service irréprochable",
    description: "Une équipe à l'écoute pour vous servir avec le sourire.",
  },
  {
    icon: Clock,
    title: "Horaires étendus",
    description: "Ouvert de 8h à 20h tous les jours, même le dimanche.",
  },
  {
    icon: Shield,
    title: "Produits frais garantis",
    description: "Nos produits sont préparés quotidiennement avec des ingrédients de qualité.",
  },
  {
    icon: Truck,
    title: "Livraison rapide",
    description: "Recevez votre commande à domicile en un rien de temps.",
  },
  {
    icon: Heart,
    title: "Fait avec passion",
    description: "Chaque création est le fruit d'un savoir-faire artisanal.",
  },
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-amber-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-amber-800 dark:text-amber-400 mb-4">
          Pourquoi nous choisir ?
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
          Découvrez ce qui fait la différence chez maseka food
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <div
                key={idx}
                className="relative bg-white dark:bg-gray-800 rounded-2xl dark:border-gray-500 border-2 p-6 text-center  transition-all duration-300 group"
              >
                {/* Cercle animé */}
                <div className="relative w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  {/* Cercle extérieur en pointillé tournant */}
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500 animate-spin-slow pointer-events-none"></div>
                  {/* Cercle intérieur solide */}
                  <div className="absolute inset-1 rounded-full bg-amber-100 dark:bg-amber-900/30"></div>
                  {/* Icône */}
                  <Icon size={40} className="relative text-amber-600 dark:text-amber-400 z-10" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </section>
  );
}