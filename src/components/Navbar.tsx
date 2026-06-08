"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useCart } from "@/hooks/useCart";
import { Truck } from "lucide-react";
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
  MessageSquare,
  ShoppingCart,
  Tag,
  Users,
} from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const { getItemCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [promoCount, setPromoCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingReservations, setPendingReservations] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  const avatarUrl = session?.user?.avatarUrl || session?.user?.image;
  const itemCount = getItemCount();

  // Récupérer tous les compteurs
  const fetchCounts = () => {
    if (session) {
      fetch("/api/user/counts")
        .then(res => res.json())
        .then(data => {
          setPendingReservations(data.pendingReservations || 0);
          setPendingOrders(data.pendingOrders || 0);
          setUnreadMessages(data.unreadMessages || 0);
        });
    }
  };

  useEffect(() => {
    fetchCounts();
    window.addEventListener("counts-updated", fetchCounts);
    return () => window.removeEventListener("counts-updated", fetchCounts);
  }, [session]);

  useEffect(() => {
    fetch("/api/promotions/count")
      .then(res => res.json())
      .then(data => setPromoCount(data.count));
  }, []);

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
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-b-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-1" onClick={closeMobileMenu}>
              <img src="/images/favicon.icon.png" alt="logo" width={50} height={50} />
              <div>
                <div className="text-2xl font-bold text-primary dark:text-white">maseka food</div>
                <div className="text-sm -mt-2 text-foreground/70">Boulangerie in butembo</div>
              </div>
            </Link>

            {/* Desktop menu (sans badges réservations/commandes) */}
            <div className="hidden desktop:flex items-center space-x-6">
              <Link href="/" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Home size={18} /> Accueil
              </Link>
              <Link href="/products" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Package size={18} /> Produits
              </Link>
              <Link href="/cart" className="relative flex items-center gap-1 text-foreground hover:text-primary transition">
                <ShoppingCart size={18} />
                <span>Panier</span>
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
              <Link href="/promotions" className="relative flex items-center gap-1 text-foreground hover:text-primary transition">
                <Tag size={18} />
                <span>Promotions</span>
                {promoCount > 0 && (
                  <span className="absolute -top-1 -right-3 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
                  </span>
                )}
              </Link>
              
              <Link href="/contact" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Phone size={18} /> Contact
              </Link>
              <Link href="/team" className="flex items-center gap-1 text-foreground hover:text-primary transition">
                <Users size={18} /> team
              </Link>

              {/* Messages badge */}
              <Link href="/messages" className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <MessageSquare size={20} />
                {unreadMessages > 0 && (
                  <span className="absolute top-0 right-0 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadMessages}
                  </span>
                )}
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
                    {avatarUrl && !avatarError ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="w-6 h-6 rounded-full object-cover"
                        onError={() => setAvatarError(true)}
                      />
                    ) : (
                      <User size={18} />
                    )}
                    <span className="hidden md:inline">{session.user?.name}</span>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-lg py-1 z-10 border border-border">
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <User size={16} /> Mon profil
                      </Link>
                      <Link href="/tracking" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <Truck size={16} /> Livraison
                      </Link>
                      {/* Commandes avec badge */}
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <ShoppingBag size={16} />
                        <span>Mes commandes</span>
                        {pendingOrders > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                            {pendingOrders}
                          </span>
                        )}
                      </Link>
                      {/* Réservations avec badge */}
                      <Link href="/reservations" className="flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <BookOpen size={16} />
                        <span>Mes réservations</span>
                        {pendingReservations > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                            {pendingReservations}
                          </span>
                        )}
                      </Link>
                      <Link href="/messages" className="relative flex items-center gap-2 px-4 py-2 text-foreground hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                        <MessageSquare size={16} />
                        <span>Mes messages</span>
                        {unreadMessages > 0 && (
                          <span className="ml-auto bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                            {unreadMessages}
                          </span>
                        )}
                      </Link>
                      {session.user?.role === "admin" && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/10 transition" onClick={() => setUserMenuOpen(false)}>
                          <LayoutDashboard size={16} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="flex w-full items-center gap-2 px-4 py-2 text-orange-600 hover:bg-orange-50 transition dark:hover:bg-orange-900/20">
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
            <button onClick={() => setMobileMenuOpen(true)} className="desktop:hidden focus:outline-none">
              <Menu size={24} className="text-foreground" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer – ajoutez les badges dans le menu déroulant comme ci-dessus (similaire à userMenuOpen) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 desktop:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobileMenu} />
          <div className="absolute right-0 top-0 h-full w-3/4 max-w-sm bg-card shadow-xl flex flex-col animate-slide-in-right">
            <div className="sticky top-0 bg-card p-4 border-b border-border flex justify-between items-center">
              <span className="font-bold text-primary">Menu</span>
              <button onClick={closeMobileMenu} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                <X size={24} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-6">
              <div className="flex flex-col space-y-4">
                <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <Home size={20} /> Accueil
                </Link>
                <Link href="/products" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <Package size={20} /> Produits
                </Link>
                <Link href="/reservations" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <Calendar size={20} /> Réservation
                </Link>
                <Link href="/orders" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <ShoppingBag size={20} /> Commandes
                </Link>
                <Link href="/cart" onClick={closeMobileMenu} className="relative flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <ShoppingCart size={20} />
                  <span>Panier</span>
                  {itemCount > 0 && <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{itemCount}</span>}
                </Link>
                <Link href="/promotions" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary relative">
                  <Tag size={20} />
                  <span>Promotions</span>
                  {promoCount > 0 && <span className="ml-2 w-2 h-2 bg-orange-500 rounded-full"></span>}
                </Link>
                <Link href="/messages" onClick={closeMobileMenu} className="relative flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <MessageSquare size={20} />
                  <span>Messages</span>
                  {unreadMessages > 0 && (
                    <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
                <Link href="/team" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                  <Users size={20} /> Équipe
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
                      {pendingOrders > 0 && <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{pendingOrders}</span>}
                    </Link>
                    <Link href="/reservations" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-foreground hover:text-primary">
                      <BookOpen size={20} /> Mes réservations
                      {pendingReservations > 0 && <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-0.5">{pendingReservations}</span>}
                    </Link>
                    {session.user?.role === "admin" && (
                      <Link href="/admin" onClick={closeMobileMenu} className="flex items-center gap-3 py-2 text-primary">
                        <LayoutDashboard size={20} /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={() => { signOut(); closeMobileMenu(); }} className="flex items-center gap-3 py-2 text-orange-600 text-left">
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
        </div>
      )}
    </>
  );
}