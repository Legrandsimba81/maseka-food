"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Fonction pour lire un cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

// Fonction pour définir un cookie
function setCookie(name: string, value: string, days: number = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
}

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Ignorer les pages admin ou API
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    let visitorId = getCookie("visitor_id");
    if (!visitorId) {
      visitorId = uuidv4();
      setCookie("visitor_id", visitorId);
    }

    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ visitorId, page: pathname }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}