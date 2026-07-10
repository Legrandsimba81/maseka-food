"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Calendar,
  MessageSquare,
  Tag,
  Settings,
  Newspaper,
  ListOrdered,
  QrCode,
  Package,
  Users,
  Menu,
  X,
  Clock,
  TrendingUp,
  Store,
  RefreshCw,
} from "lucide-react";
import { Star } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({
    pendingOrders: 0,
    pendingReservations: 0,
    unreadMessages: 0,
  });
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/admin/counts");
        if (res.ok) {
          const data = await res.json();
          setCounts(data);
        }
      } catch (error) {
        console.error("Erreur chargement compteurs:", error);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);

    const fetchLowStock = async () => {
      try {
        const res = await fetch("/api/admin/stock/alert-count");
        if (res.ok) {
          const data = await res.json();
          setLowStockCount(data.count);
        }
      } catch (e) {}
    };
    fetchLowStock();

    return () => {
      clearInterval(interval);
    };
  }, []);

  const mainNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart, badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined },
    { href: "/admin/reservations", label: "Réservations", icon: Calendar, badge: counts.pendingReservations > 0 ? counts.pendingReservations : undefined },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: counts.unreadMessages > 0 ? counts.unreadMessages : undefined },
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ];

  const sideNavItems = [
    { href: "/admin/products", label: "Produits", icon: Package },
    { href: "/admin/promotions", label: "Promotions", icon: Tag },
    { href: "/admin/employees", label: "Employés", icon: Users },
    { href: "/admin/attendance", label: "Pointages", icon: Clock },
    { href: "/admin/attendance/stats", label: "Statistiques", icon: TrendingUp },
    { href: "/admin/attendance/calendar", label: "Calendrier", icon: Calendar },
    // 🟡 "Sections" avec highlight pour attirer l'attention
    { href: "/admin/sections", label: "Sections", icon: Store, highlight: true },
    { href: "/admin/stock", label: "Stock", icon: Package, alert: lowStockCount > 0 },
    { href: "/admin/stock/movements", label: "Mouvements stock", icon: RefreshCw },
    { href: "/admin/reviews", label: "Avis Produits", icon: Star },
    { href: "/admin/bakery-reviews", label: "Avis Boulangerie", icon: Star },
    { href: "/admin/team", label: "Équipe", icon: Users },
    { href: "/admin/categories-order", label: "Catégories", icon: ListOrdered },
    { href: "/admin/qrcode", label: "QR Codes", icon: QrCode },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Barre horizontale fixe */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-14">
            <button
              onClick={toggleSidebar}
              className="p-1.5 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-300" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1.5 flex-1 justify-end">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap relative ${
                    pathname === item.href
                      ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 bg-orange-500 text-white text-[10px] rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Conteneur principal avec sidebar */}
      <div className="flex flex-1">
        <aside
          className={`
            fixed lg:sticky top-[calc(4rem+56px)] left-0 z-30
            w-64 h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:block
            overflow-y-auto py-4 px-3
          `}
        >
          <div className="flex items-center justify-between px-2 mb-4 lg:hidden">
            <span className="font-semibold text-gray-700 dark:text-gray-200">Menu</span>
            <button onClick={closeSidebar} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-1">
            {sideNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors relative ${
                  pathname === item.href
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    : item.highlight
                      ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/30"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.alert && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <span className="relative inline-flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}