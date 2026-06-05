"use client";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/lib/format";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

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
      <h1 className="text-3xl font-bold mb-8">Mon panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map(item => (
            <div key={item.productId} className="flex gap-4 border-b py-4 ">
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center text-4xl">🥖</div>
              <div className="flex-1 px-4 overflow-auto">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-orange-500 font-bold">{formatPrice(item.price)} $</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-4 text-orange-500">Supprimer</button>
                </div>
              </div>
              <div className="text-right"><p className="font-bold">{(item.price * item.quantity).toFixed(2)} $</p></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Livraison</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Adresse</label>
            <input
              type="text"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500"
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
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-amber-500 focus:border-amber-500"
              required
            />
          </div>
          <div className="flex justify-between mb-2"><span>Total</span><span className="font-bold text-xl">{getTotal().toFixed(2)} $</span></div>
          <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full mt-4">{loading ? "Commande en cours..." : "Valider la commande"}</button>
          <button onClick={clearCart} className="btn-secondary w-full mt-2">Vider le panier</button>
        </div>
      </div>
    </div>
  );
}