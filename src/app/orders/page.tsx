"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtTime: number;
  product: { name: string };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  adminNote?: string | null;
  paymentMethod?: string | null;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) {
      fetch("/api/orders")
        .then(res => res.json())
        .then(data => { setOrders(data); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [session, status]);

  const getPaymentInstructions = (method?: string) => {
    switch (method) {
      case "mpesa": return "Composez *182# → 'Payer facture' → entrez votre code commerçant 123456 → référence : commande ID et montant.";
      case "airtel": return "Composez *111# → 'Airtel Money' → 'Payer' → suivant les instructions.";
      case "orange": return "Composez *144# → 'Orange Money' → 'Payer facture'.";
      default: return "Veuillez contacter la boulangerie pour les instructions de paiement.";
    }
  };

  if (status === "loading" || loading) return <div className="text-center py-8">Chargement...</div>;
  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Aucune commande</h1>
        <Link href="/products" className="btn-primary">Découvrir nos produits</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mes commandes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="card-header">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Commande #{order.id.slice(0,8)}</p>
                  <p className="text-sm text-muted-foreground">Le {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  order.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Annulée"}
                </span>
              </div>
            </div>
            <div className="card-content">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{(item.priceAtTime * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
              {order.adminNote && <p className="text-sm text-muted-foreground mt-2">Note : {order.adminNote}</p>}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span><span>{order.totalAmount.toFixed(2)} €</span>
              </div>
              {order.status === "confirmed" && (
                <div className="mt-4">
                  <button onClick={() => { setSelectedOrder(order); setShowInstructions(true); }} className="btn-primary w-full">
                    💳 Instructions de paiement USSD
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showInstructions && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Paiement par {selectedOrder.paymentMethod === "mpesa" ? "M-Pesa" : selectedOrder.paymentMethod === "airtel" ? "Airtel Money" : "Orange Money"}</h2>
            <p className="mb-4">{getPaymentInstructions(selectedOrder.paymentMethod)}</p>
            <p className="text-sm text-muted-foreground mb-4">Montant à payer : {selectedOrder.totalAmount.toFixed(2)} €</p>
            <button onClick={() => setShowInstructions(false)} className="btn-secondary w-full">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}