"use client";
import BackButton from "@/components/BackButton";
import { BookOpen, ShoppingCart, Calendar, Truck, CreditCard, MessageCircle } from "lucide-react";

const steps = [
  {
    icon: ShoppingCart,
    title: "Passer une commande",
    description: "Parcourez nos produits, ajoutez-les au panier, puis validez votre commande. Vous pouvez choisir l'adresse et l'heure de livraison.",
  },
  {
    icon: Calendar,
    title: "Réserver une table",
    description: "Réservez une table pour déguster nos pains et pâtisseries sur place. Choisissez la date, l'heure et le nombre de personnes.",
  },
  {
    icon: Truck,
    title: "Suivre votre commande",
    description: "Accédez à l'historique de vos commandes et suivez l'état de votre livraison en temps réel.",
  },
  {
    icon: CreditCard,
    title: "Paiement par USSD",
    description: "Après confirmation de votre commande, suivez les instructions de paiement par M-Pesa, Airtel Money ou Orange Money.",
  },
  {
    icon: MessageCircle,
    title: "Contacter la boulangerie",
    description: "Utilisez le formulaire de contact ou envoyez un message directement depuis votre espace client.",
  },
];

export default function GuidePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <BackButton />
      <h1 className="text-3xl font-bold mt-4 mb-2">Guide d'utilisation</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-8">
        Découvrez comment profiter au mieux de votre expérience sur maseka food.
      </p>

      <div className="space-y-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 flex gap-4 items-start"
            >
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
                <Icon size={22} />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {idx + 1}. {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
        <p className="text-sm text-amber-700 dark:text-amber-300">
          📌 Besoin d'aide ? N'hésitez pas à nous contacter via la page{" "}
          <a href="/contact" className="underline font-medium hover:text-amber-800">
            Contact
          </a>{" "}
          ou par WhatsApp au <strong>+243 827 733 286</strong>.
        </p>
      </div>
    </div>
  );
}