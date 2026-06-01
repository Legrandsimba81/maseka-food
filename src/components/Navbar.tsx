"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  Home,
  Package,
  Calendar,
  Phone,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ShoppingBag,
  BookOpen,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const toggleUserMenu = () => setUserMenuOpen((prev) => !prev);

  if (!mounted) return null;

  return (
    <>
      <nav className="bg-background border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-1" onClick={closeMobileMenu}>
              <img src="/images/favicon.icon.png" alt="logo" width={50} height={50} />
              <div>
                <div className="text-2xl font-bold text-primary">maseka food</div>
                <div className="text-sm -mt-2 text-foreground/70">Boulangerie in butembo</div>
              </div>
            </Link>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Home size={18} /> Accueil
              </Link>
              <Link href="/products" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Package size={18} /> Produits
              </Link>
              <Link href="/reservations" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Calendar size={18} /> Réservation
              </Link>
              <Link href="/contact" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Phone size={18} /> Contact
              </Link>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {theme === "dark" ? <Sun size={20} className="text-primary" /> : <Moon size={20} className="text-primary" />}
              </button>

              {session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-1 text-foreground hover:text-primary transition focus:outline-none"
                  >
                    <User size={18} />
                    <span>{session.user?.name}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg py-1 z-10 border border-border">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <User size={16} /> Mon profil
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <ShoppingBag size={16} /> Mes commandes
                      </Link>
                      <Link href="/reservations" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <BookOpen size={16} /> Mes réservations
                      </Link>
                      {session.user?.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition dark:hover:bg-red-900/20">
                        <LogOut size={16} /> Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="bg-primary text-white px-5 py-2 rounded-xl hover:bg-primary-dark transition">
                  Connexion
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden focus:outline-none">
              <Menu size={24} className="text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-card shadow-xl flex flex-col animate-slide-in-right">
            <div className="flex justify-between items-center p-4 border-b border-border">
              <span className="font-bold text-primary">Menu</span>
              <button onClick={closeMobileMenu} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={24} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 flex flex-col space-y-4 px-6 py-4">
              <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                <Home size={20} /> Accueil
              </Link>
              <Link href="/products" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                <Package size={20} /> Produits
              </Link>
              <Link href="/reservation" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                <Calendar size={20} /> Réservation
              </Link>
              <Link href="/contact" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                <Phone size={20} /> Contact
              </Link>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex items-center gap-3 py-2 text-foreground hover:text-primary"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                Mode {theme === "dark" ? "clair" : "sombre"}
              </button>
              <hr className="border-border" />
              {session ? (
                <>
                  <Link href="/profile" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                    <User size={20} /> Mon profil
                  </Link>
                  <Link href="/orders" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                    <ShoppingBag size={20} /> Mes commandes
                  </Link>
                  <Link href="/reservations" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                    <BookOpen size={20} /> Mes réservations
                  </Link>
                  {session.user?.role === "admin" && (
                    <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-primary">
                      <LayoutDashboard size={20} /> Admin Dashboard
                    </Link>
                  )}
                  <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex items-center gap-3 py-2 text-red-600 text-left">
                    <LogOut size={20} /> Déconnexion
                  </button>
                </>
              ) : (
                <Link href="/login" onClick={closeMobileMenu} className="bg-primary text-white text-center py-2 px-4 rounded-lg">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}