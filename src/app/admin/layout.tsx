"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LayoutDashboard, Package, ShoppingCart, Calendar, MessageSquare, Tag, ListOrdered, Settings } from "lucide-react";
import { Newspaper } from "lucide-react";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
    // Optionnel : rafraîchir périodiquement
    const interval = setInterval(fetchCounts, 30000); // toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produits", icon: Package },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart, badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined },
    { href: "/admin/reservations", label: "Réservations", icon: Calendar, badge: counts.pendingReservations > 0 ? counts.pendingReservations : undefined },
    { href: "/admin/articles", label: "Articles", icon: Newspaper },
    { href: "/admin/messages", label: "Messages", icon: MessageSquare, badge: counts.unreadMessages > 0 ? counts.unreadMessages : undefined },
    { href: "/admin/promotions", label: "Promotions", icon: Tag },
    { href: "/admin/categories-order", label: "Catégories", icon: ListOrdered },
    { href: "/admin/settings", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menu horizontal */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-t border-b border-gray-300 dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-center sm:justify-start space-x-4 sm:space-x-1 overflow-x-auto py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center sm:gap-2 px-6 sm:px-4 py-2 lg:px-7 lg:py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-orange-100 text-orange-600 rounded-xl sm:rounded-2xl"
                    : "text-gray-600 dark:text-gray-300 hover:text-orange-500"
                }`}
              >
                <item.icon size={18} />
                <span className="hidden sm:inline">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}