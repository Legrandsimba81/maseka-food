"use client";
import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Package, MessageCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    if (!deliveryAddress || !deliveryTime) {
      toast.error("Veuillez renseigner l'adresse et l'heure de livraison");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        totalAmount: getTotal(),
        deliveryAddress,
        deliveryTime,
      }),
    });
    if (res.ok) {
      clearCart();
      toast.success("Commande validée !");
      router.push("/orders");
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur");
    }
    setLoading(false);
  };

  const generateWhatsAppMessage = () => {
    if (items.length === 0) return "";
    let message = "*🛒 MA COMMANDE MASEKA FOOD*\n\n";
    items.forEach(item => {
      message += `🍔 *${item.name}* : ${item.quantity} x ${formatPrice(item.price)} $ = ${formatPrice(item.price * item.quantity)} $\n`;
    });
    message += `\n📍 *Adresse :* ${deliveryAddress || "non renseignée"}`;
    message += `\n⏰ *Heure de livraison :* ${deliveryTime || "non renseignée"}`;
    message += `\n💰 *Total :* ${formatPrice(getTotal())} $\n\n`;
    message += "_Merci de confirmer votre commande. Nous vous contacterons pour le paiement._";
    return encodeURIComponent(message);
  };

  const handleWhatsApp = () => {
    if (items.length === 0) {
      toast.error("Panier vide");
      return;
    }
    if (!deliveryAddress || !deliveryTime) {
      toast.error("Veuillez renseigner l'adresse et l'heure de livraison");
      return;
    }
    const phoneNumber = "243827733286"; // Numéro WhatsApp de Maseka Food (sans +)
    const url = `https://wa.me/${phoneNumber}?text=${generateWhatsAppMessage()}`;
    window.open(url, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Panier vide</h1>
        <Link href="/products" className="btn-primary">Voir produits</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Mon panier</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Liste des produits – toujours en ligne */}
        <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {items.map(item => (
            <div key={item.productId} className="flex flex-nowrap items-center gap-2 sm:gap-4 border-b py-3">
              {/* Icône */}
              <div className="w-12 h-12 p-4 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-gray-500 sm:size-32" />
              </div>
              {/* Détails */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold truncate">{item.name}</h3>
                <p className="text-orange-500 font-bold text-sm sm:text-base">{formatPrice(item.price)} $</p>
                <div className="flex items-center gap-1 sm:gap-2 mt-1">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-0.5 border rounded text-sm">-</button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-0.5 border rounded text-sm">+</button>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-2 text-orange-500 text-xs sm:text-sm">Supprimer</button>
                </div>
              </div>
              {/* Prix total */}
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-sm sm:text-base">{formatPrice(item.price * item.quantity)} $</p>
              </div>
            </div>
          ))}
        </div>

        {/* Récapitulatif */}
        <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-800 p-4 sm:p-6 rounded-lg h-fit">
          <h2 className="text-lg sm:text-xl font-bold mb-4">Livraison</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="input-field text-sm"
              required
              placeholder="Rue, numéro, ville"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Heure de livraison</label>
            <input
              type="time"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="input-field text-sm"
              required
            />
          </div>
          <div className="flex justify-between mb-2">
            <span>Total</span>
            <span className="font-bold text-xl">{formatPrice(getTotal())} $</span>
          </div>
          <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full mt-4">
            {loading ? "Commande en cours..." : "Valider la commande"}
          </button>
          <button onClick={handleWhatsApp} className="btn-secondary bg-green-600 hover:bg-green-700 text-white w-full mt-2 flex items-center justify-center gap-2">
            <MessageCircle size={18} /> Commander via WhatsApp
          </button>
          <button onClick={clearCart} className="btn-secondary w-full mt-2">Vider le panier</button>
        </div>
      </div>
    </div>
  );
}