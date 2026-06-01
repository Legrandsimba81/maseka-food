"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Calendar } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produits", icon: Package },
    { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
    { href: "/admin/reservations", label: "Réservations", icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Menu horizontal */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "border-b-2 border-red-500 text-red-500"
                    : "text-gray-600 dark:text-gray-300 hover:text-red-500"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}