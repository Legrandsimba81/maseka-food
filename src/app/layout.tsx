// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'yes',
};

// Métadonnées SEO globales
export const metadata: Metadata = {
  title: 'Maseka Food - Boulangerie & Pâtisserie | Butembo',
  description: 'La meilleure boulangerie de Butembo, Nord-Kivu. Pains frais, gâteaux, fast-food, pizzas et bien plus. Livraison disponible.',
  keywords: 'boulangerie Butembo, pain Butembo, gâteau cérémonie, fast-food Nord-Kivu, pizza Butembo, livraison Butembo',
  authors: [{ name: 'Maseka Food' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Maseka Food - Boulangerie & Pâtisserie à Butembo',
    description: 'Découvrez nos délicieux produits frais. Livraison disponible dans Butembo.',
    url: 'https://masekafood.cd',
    siteName: 'Maseka Food',
    images: [
      {
        url: '/images/hero-bakery.jpg',
        width: 1200,
        height: 630,
        alt: 'Maseka Food - Boulangerie',
      },
    ],
    locale: 'fr_CD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Maseka Food - Boulangerie & Pâtisserie à Butembo',
    description: 'Découvrez nos délicieux produits frais. Livraison disponible dans Butembo.',
    images: ['/images/hero-bakery.jpg'],
  },
  alternates: {
    canonical: 'https://masekafood.cd',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        {/* Script JSON-LD (Schema.org) */}
        <Script
          id="schema-bakery"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Bakery",
              "name": "Maseka Food",
              "url": "https://masekafood.cd",
              "description": "Boulangerie et pâtisserie à Butembo, Nord-Kivu",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Avenue de la Paix",
                "addressLocality": "Butembo",
                "addressRegion": "Nord-Kivu",
                "addressCountry": "RD Congo"
              },
              "telephone": "+243-970-000-000",
              "openingHours": "Mo-Su 06:00-20:00",
              "priceRange": "$$",
              "servesCuisine": ["Française", "Congolaise", "Fast-food"]
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <Toaster position="top-center" reverseOrder={false} />
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

