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
    return () => clearInterval(interval);
  }, []);

  // Menu horizontal (éléments principaux)
  const mainNavItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart, badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined },
    { href: "/admin/reservations", label: "Réservations", icon: Calendar, badge: counts.pendingReservations > 0 ? counts.pendingReservations : undefined },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: counts.unreadMessages > 0 ? counts.unreadMessages : undefined },
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ];

  // Menu vertical (éléments secondaires – affichés dans la sidebar)
  const sideNavItems = [
    { href: "/admin/categories-order", label: "Catégories", icon: ListOrdered },
    { href: "/admin/qrcode", label: "QR Codes", icon: QrCode },
    { href: "/admin/products", label: "Produits", icon: Package },
    { href: "/admin/reviews", label: "Avis Produits", icon: Star },
    { href: "/admin/bakery-reviews", label: "Avis Boulangerie", icon: Star }, ,
    { href: "/admin/promotions", label: "Promotions", icon: Tag },
    { href: "/admin/team", label: "Équipe", icon: Users },
    { href: "/admin/stock", label: "Stock", icon: Package },
    { href: "/admin/employees", label: "Employés", icon: Users },
    // { href: "/admin/attendance/scan", label: "Scanner", icon: QrCode },
    { href: "/admin/attendance", label: "Pointages", icon: Clock },
    { href: "/admin/attendance/stats", label: "Statistiques", icon: TrendingUp },
  ];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col">
      {/* Barre horizontale fixe (sticky) avec menu horizontal */}
      <div className="sticky top-16 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-300 dark:border-gray-700">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center h-14">
            {/* Bouton burger (visible sur mobile) */}
            <button
              onClick={toggleSidebar}
              className="p-1.5 mr-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} className="text-gray-600 dark:text-gray-300" />
            </button>

            {/* Menu horizontal (toujours visible, compact sur mobile) */}
            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto py-1.5 flex-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${pathname === item.href
                    ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <item.icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-0.5 bg-orange-500 text-white text-[10px] rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar vertical (affichée sur desktop, ouverte via burger sur mobile) */}
        <aside
          className={`
            fixed lg:sticky top-32 left-0 z-30
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
                className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${pathname === item.href
                  ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* Overlay pour fermer la sidebar sur mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={closeSidebar}
          ></div>
        )}

        {/* Contenu principal */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}