"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

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
  // paymentMethod supprimé – on ne le stocke pas en base
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
  const [chosenMethod, setChosenMethod] = useState<string>(""); // méthode choisie temporairement

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
      case "mpesa":
        return "M-Pesa";
      case "airtel":
        return "Airtel Money";
      case "orange":
        return "Orange Money";
      default:
        return "Moyen de paiement";
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
      <div className="w-full md:w-[700px] my-6 text-left">
        <p className="text-gray-400 mx">
          Votre commande sera traitée une fois confirmée par la boulangerie. Vous recevrez les instructions de paiement. par commande confirmée, vous pouvez choisir votre moyen de paiement et suivre les instructions pour finaliser votre achat. 
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="card-header">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Commande #{order.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">Le {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : order.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status === "pending" ? "En attente" : order.status === "confirmed" ? "Confirmée" : "Annulée"}
                </span>
              </div>
            </div>
            <div className="card-content">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-1">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>{formatPrice(item.priceAtTime * item.quantity)} $</span>
                </div>
              ))}
              {order.adminNote && <p className="text-sm text-orange-500 mt-2">Note : {order.adminNote}</p>}
              <div className="border-t mt-2 pt-2 font-bold flex justify-between">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)} $</span>
              </div>
              {order.status === "confirmed" && (
                <div className="mt-4">
                  <button
                    onClick={() => handleShowInstructions(order)}
                    className="btn-primary w-full py-2"
                  >
                    Instructions de paiement
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de sélection du moyen de paiement */}
      {showMethodSelector && currentOrderForMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Choisissez votre moyen de paiement</h2>
            <div className="space-y-3">
              <button onClick={() => selectPaymentMethod("mpesa")} className="btn-secondary w-full">
                M-Pesa
              </button>
              <button onClick={() => selectPaymentMethod("airtel")} className="btn-secondary w-full">
                Airtel Money
              </button>
              <button onClick={() => selectPaymentMethod("orange")} className="btn-secondary w-full">
                Orange Money
              </button>
            </div>
            <button
              onClick={() => setShowMethodSelector(false)}
              className="mt-4 text-sm text-muted-foreground w-full text-center"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Modal d'affichage des instructions */}
      {showInstructions && selectedOrder && chosenMethod && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Paiement par {getPaymentMethodLabel(chosenMethod)}</h2>
            <p className="mb-4">{getPaymentInstructions(chosenMethod)}</p>
            {selectedOrder.paymentStatus === "paid_by_ussd" && (
              <p className="text-sm text-green-600 mt-1">✅ Payé par USSD</p>
            )}
            <p className="text-sm text-muted-foreground mb-4">
              Montant à payer : <strong>{formatPrice(selectedOrder.totalAmount)} $</strong>
            </p>
            <button onClick={() => setShowInstructions(false)} className="btn-secondary w-full">
              Fermer
            </button>
          </div>
        </div>
      )}
      <div className="w-full md:w-[700px] mx-auto mt-6 md:text-center">
        <p className="text-gray-400">
          Le paiement de facture se fais en USSD cliqué pour voir les instructions <br />
          selon les operateurs, pour finaliser votre achat ou programer une livraison ou encore d'autres préocupation
          vous utiliserais le numero whatsApp maseka food +234 827 733 286.
        </p>
      </div>
    </div>
  );
}