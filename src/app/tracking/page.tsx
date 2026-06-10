"use client";
import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { HelpCircle, Phone, MessageCircle } from "lucide-react";

const getDeliveryStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return { label: "En préparation", color: "bg-yellow-100 text-yellow-800" };
    case "shipped": return { label: "En livraison", color: "bg-blue-100 text-blue-800" };
    case "delivered": return { label: "Livré", color: "bg-green-100 text-green-800" };
    default: return { label: status, color: "bg-gray-100 text-gray-800" };
  }
};

const whatsappNumber = "243827733286";

export default function TrackingPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trackOrder = async () => {
    if (!orderId) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/tracking/${orderId}`);
    const data = await res.json();
    if (res.ok) setOrder(data);
    else setError(data.error);
    setLoading(false);
  };

  if (loading) return <div className="text-center py-8">Chargement...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Suivi de livraison</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Numéro de commande (ID)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="input-field flex-1"
        />
        <button onClick={trackOrder} className="btn-primary">Suivre</button>
      </div>
      {order && (
        <div className="card p-4 space-y-4">
          <p><strong>Commande n°</strong> {order.id}</p>
          <p><strong>Date de commande</strong> {new Date(order.createdAt).toLocaleString()}</p>
          <p><strong>Adresse de livraison</strong> {order.deliveryAddress}</p>
          <p><strong>Heure de livraison souhaitée</strong> {order.deliveryTime}</p>
          <p><strong>Statut de la commande</strong> {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Annulée"}</p>
          <p><strong>Statut de livraison</strong> <span className={`px-2 py-1 rounded-full text-xs ${getDeliveryStatusLabel(order.deliveryStatus).color}`}>{getDeliveryStatusLabel(order.deliveryStatus).label}</span></p>
          <div><strong>Total</strong> {formatPrice(order.totalAmount)} $</div>
          <div><strong>Produits</strong>
            <ul className="list-disc list-inside mt-2">
              {order.items.map((item, idx) => (
                <li key={idx}>{item.product.name} x {item.quantity} = {formatPrice(item.priceAtTime * item.quantity)} $</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <HelpCircle size={20} /> Besoin d'aide ?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Une question sur votre livraison ? Un problème avec votre commande ? Contactez-nous directement.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2">
                <Phone size={18} /> Service client
              </Link>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Bonjour%2C%20j%27ai%20une%20question%20concernant%20ma%20commande%20n°${order.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary bg-green-600 hover:bg-green-700 text-white inline-flex items-center gap-2"
              >
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Pour toute réclamation, merci de préciser votre numéro de commande : {order.id}
            </p>
          </div>
          <Link href="/orders" className="btn-primary inline-block mt-4">Retour à mes commandes</Link>
        </div>
      )}
    </div>
  );
}