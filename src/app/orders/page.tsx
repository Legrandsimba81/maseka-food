"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { Copy, Check, Receipt, Truck, Clock, AlertCircle } from "lucide-react";

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
  paymentStatus?: string;
  deliveryStatus?: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showMethodSelector, setShowMethodSelector] = useState(false);
  const [currentOrderForMethod, setCurrentOrderForMethod] = useState<Order | null>(null);
  const [chosenMethod, setChosenMethod] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session, status]);

  const getPaymentInstructions = (method: string) => {
    const m = method.toLowerCase();
    switch (m) {
      case "mpesa":
        return "M-Pesa : Composez *1122# → '1.M-pesa USD' → '5. Mes paiements' → '2.Achat Produits' → 'Numero caise 03281450' → 'Montant' → 'Raison 1' → entrez votre code → suivez les instructions";
      case "airtel":
        return "Airtel Money : Composez *111# → 'Airtel Money' → 'Payer' → suivez les instructions.";
      case "orange":
        return "Orange Money : Composez *144# → 'Orange Money' → 'Payer facture'.";
      default:
        return "Veuillez contacter la boulangerie pour finaliser votre paiement.";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    const m = method.toLowerCase();
    switch (m) {
      case "mpesa": return "M-Pesa";
      case "airtel": return "Airtel Money";
      case "orange": return "Orange Money";
      default: return "Moyen de paiement";
    }
  };

  const handleShowInstructions = (order: Order) => {
    setCurrentOrderForMethod(order);
    setShowMethodSelector(true);
  };

  const selectPaymentMethod = (method: string) => {
    setChosenMethod(method);
    setShowMethodSelector(false);
    if (currentOrderForMethod) {
      setSelectedOrder(currentOrderForMethod);
      setShowInstructions(true);
    }
  };

  const copyToClipboard = (text: string, orderId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 2000);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mes commandes</h1>
        <div className="text-sm text-gray-500">
          {orders.length} commande{orders.length > 1 && 's'}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8 max-w-2xl">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Votre commande sera traitée une fois confirmée par la boulangerie. 
          Vous recevrez les instructions de paiement. Pour toute commande confirmée, 
          choisissez votre moyen de paiement et suivez les instructions pour finaliser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => {
          const statusBadge = {
            pending: { label: "En attente", className: "bg-yellow-100 text-yellow-800" },
            confirmed: { label: "Confirmée", className: "bg-green-100 text-green-800" },
            cancelled: { label: "Annulée", className: "bg-red-100 text-red-800" },
          }[order.status] || { label: order.status, className: "bg-gray-100 text-gray-800" };

          const deliveryStatusMap = {
            pending: { label: "En préparation", icon: <Clock size={14} className="text-yellow-500" /> },
            shipped: { label: "En livraison", icon: <Truck size={14} className="text-blue-500" /> },
            delivered: { label: "Livré", icon: <Check size={14} className="text-green-500" /> },
          };
          const deliveryStatus = deliveryStatusMap[order.deliveryStatus as keyof typeof deliveryStatusMap] || null;

          return (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition hover:shadow-lg">
              {/* En-tête */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                      #{order.id.slice(0, 8)}
                    </p>
                    <button
                      onClick={() => copyToClipboard(order.id, order.id)}
                      className="text-gray-400 hover:text-gray-600 transition"
                      title="Copier l'ID complet"
                    >
                      {copiedId === order.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                  {deliveryStatus && (
                    <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                      {deliveryStatus.icon} {deliveryStatus.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Corps */}
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                      <span className="font-medium">{formatPrice(item.priceAtTime * item.quantity)} $</span>
                    </div>
                  ))}
                </div>

                {/* Note admin */}
                {order.adminNote && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm flex items-start gap-2">
                    <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-orange-700 dark:text-orange-300">Note de la boulangerie</p>
                      <p className="text-orange-600 dark:text-orange-400">{order.adminNote}</p>
                    </div>
                  </div>
                )}

                <div className="border-t dark:border-gray-700 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)} $</span>
                </div>

                {order.paymentStatus === "paid_by_ussd" && (
                  <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1">
                    Payé par USSD
                  </div>
                )}

                {order.status === "confirmed" && (
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      onClick={() => handleShowInstructions(order)}
                      className="btn-primary py-1.5 px-4 text-sm"
                    >
                      Instructions de paiement
                    </button>
                    <Link
                      href={`/tracking/${order.id}`}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Suivre la commande →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals - inchangés mais avec design amélioré */}
      {showMethodSelector && currentOrderForMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Choisissez votre moyen de paiement</h2>
            <div className="space-y-3">
              <button onClick={() => selectPaymentMethod("mpesa")} className="btn-secondary w-full justify-center">M-Pesa</button>
              <button onClick={() => selectPaymentMethod("airtel")} className="btn-secondary w-full justify-center">Airtel Money</button>
              <button onClick={() => selectPaymentMethod("orange")} className="btn-secondary w-full justify-center">Orange Money</button>
            </div>
            <button onClick={() => setShowMethodSelector(false)} className="mt-4 text-sm text-gray-500 w-full text-center hover:underline">Annuler</button>
          </div>
        </div>
      )}

      {showInstructions && selectedOrder && chosenMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Paiement par {getPaymentMethodLabel(chosenMethod)}</h2>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 whitespace-pre-wrap text-sm">
              {getPaymentInstructions(chosenMethod)}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              Montant à payer : <strong className="text-lg">{formatPrice(selectedOrder.totalAmount)} $</strong>
            </p>
            <button onClick={() => setShowInstructions(false)} className="btn-secondary w-full">Fermer</button>
          </div>
        </div>
      )}

      <div className="mt-10 max-w-2xl mx-auto text-center text-sm text-gray-500 border-t dark:border-gray-700 pt-6">
        <p>
          Le paiement de facture se fait en USSD. Cliquez sur « Instructions de paiement » 
          pour voir les étapes selon votre opérateur. Pour toute question, contactez-nous sur 
          WhatsApp au <a href="https://wa.me/243827733286" className="text-green-600 hover:underline">+243 827 733 286</a>.
        </p>
      </div>
    </div>
  );
}