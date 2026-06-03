"use client";  // ← Ajoutez ceci tout en haut

// ... le reste de votre composant
import Link from 'next/link';
import { Home, ShoppingBag, Calendar, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-2xl mx-auto">
        {/* Illustration ou image (optionnelle) - vous pouvez remplacer par une image personnalisée */}
        <div className="mb-8">
          <div className="text-9xl font-bold text-amber-600 dark:text-amber-400">404</div>
          <div className="text-6xl mt-4">🥖</div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Oups ! Page introuvable
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          La page que vous recherchez n'existe pas ou a été déplacée.
          Mais ne vous inquiétez pas, notre pain frais est toujours là !
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <Home size={20} />
            Retour à l'accueil
          </Link>
          
          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <ShoppingBag size={20} />
            Voir les produits
          </Link>
          
          <Link
            href="/reservation"
            className="inline-flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <Calendar size={20} />
            Réserver une table
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>Erreur 404 – Page non trouvée</p>
          <p className="mt-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-amber-600 hover:underline"
            >
              <ArrowLeft size={14} />
              Revenir à la page précédente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}