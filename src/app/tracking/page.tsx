"use client";
import { useState } from "react";
import { formatPrice } from "@/lib/format";

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
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {order && (
        <div className="card p-4 space-y-2">
          <p><strong>Commande n°</strong> {order.id}</p>
          <p><strong>Statut</strong> {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : order.status === "cancelled" ? "Annulée" : order.status}</p>
          <p><strong>Adresse de livraison</strong> {order.deliveryAddress}</p>
          <p><strong>Heure de livraison</strong> {order.deliveryTime}</p>
          <p><strong>Total</strong> {formatPrice(order.totalAmount)} $</p>
          <ul>
            {order.items.map(item => (
              <li key={item.id}>{item.product.name} x {item.quantity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}