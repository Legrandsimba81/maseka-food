"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from "react-icons/md";

export default function Footer() {
  const { data: session } = useSession();

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/images/favicon.icon.png" alt="Maseka Food" width={40} height={40} />
              <div>
                <div className="text-2xl font-bold text-primary dark:text-white">maseka food</div>
                <div className="text-sm -mt-2 text-foreground/70">Boulangerie in butembo</div>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Maseka Food Boulangerie à Butembo. Pizza, humburger, viennoiseries et pâtisseries faits avec passion.
            </p>

            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-primary transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition">
                <FaInstagram size={20} />
              </a>
            </div>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Liens rapides</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Accueil</Link></li>
              <li><Link href="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Nos produits</Link></li>
              <li><Link href="/reservation" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Réservation</Link></li>
              <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Contact</Link></li>
              {session?.user?.role === "admin" && (
                <li><Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-primary text-sm">Administration</Link></li>
              )}
            </ul>
          </div>

          {/* Horaires & contact */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Horaires</h3>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
              <li className="flex items-center gap-2"><Clock size={16} /> Lundi – Samedi : 8h00 – 19h40</li>
              <li className="flex items-center gap-2"><Clock size={16} /> Dimanche : 8h00 – 20h </li>
            </ul>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Contact</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                <li className="flex items-center gap-2"><Phone size={16} /> +243 827 733 286</li>
                <li className="flex items-center gap-2"><Mail size={16} /> contact@masekafood.com</li>
                <li className="flex items-center gap-2"><MapPin size={16} /> Commune de Bulengera, Butembo, RDC</li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Newsletter</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
              Recevez nos offres spéciales et actualités.
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition"
              >
                S'abonner
              </button>
            </form>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-3">
              En vous abonnant, vous acceptez notre politique de confidentialité.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} team digital maseka food – Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}