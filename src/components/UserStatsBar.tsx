"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Calendar, ShoppingBag, MessageSquare } from "lucide-react";

export default function UserStatsBar() {
  const { data: session } = useSession();
  const [counts, setCounts] = useState({ pendingReservations: 0, pendingOrders: 0, unreadMessages: 0 });

  useEffect(() => {
    if (session) {
      fetch("/api/user/counts")
        .then(res => res.json())
        .then(data => setCounts(data));
    }
  }, [session]);

  if (!session) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-800 py-2 px-4 shadow-sm sticky top-16 z-40">
      <div className="container mx-auto flex justify-around items-center text-sm">
        <Link href="/reservations" className="flex items-center gap-1 relative">
          <Calendar size={18} />
          <span>Réservations</span>
          {counts.pendingReservations > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {counts.pendingReservations}
            </span>
          )}
        </Link>
        <Link href="/orders" className="flex items-center gap-1 relative">
          <ShoppingBag size={18} />
          <span>Commandes</span>
          {counts.pendingOrders > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {counts.pendingOrders}
            </span>
          )}
        </Link>
        <Link href="/messages" className="flex items-center gap-1 relative">
          <MessageSquare size={18} />
          <span>Messages</span>
          {counts.unreadMessages > 0 && (
            <span className="absolute -top-2 -right-3 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {counts.unreadMessages}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}