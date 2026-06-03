"use client";

import { useCart } from "@/hooks/useCart";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotal, clearCart } = useCart();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("mpesa");

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast.error("Votre panier est vide");
      return;
    }
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        totalAmount: getTotal(),
        paymentMethod,
      }),
    });
    if (res.ok) {
      clearCart();
      toast.success("Commande validée !");
      router.push("/orders");
    } else {
      const data = await res.json();
      toast.error(data.error || "Erreur lors de la commande");
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
        <Link href="/products" className="btn-primary">Voir les produits</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon panier</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 border-b py-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-4xl">🥖</div>
              <div className="flex-1">
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-red-600 font-bold">{item.price.toFixed(2)} $</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
                  <button onClick={() => removeFromCart(item.productId)} className="ml-4 text-red-600 text-sm">Supprimer</button>
                </div>
              </div>
              <div className="text-right"><p className="font-bold">{(item.price * item.quantity).toFixed(2)} $</p></div>
            </div>
          ))}
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Récapitulatif</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Moyen de paiement</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="input-field">
              <option value="mpesa">M-Pesa (USSD *182#)</option>
              <option value="airtel">Airtel Money (USSD *111#)</option>
              <option value="orange">Orange Money (USSD *144#)</option>
            </select>
          </div>
          <div className="flex justify-between mb-2"><span>Total</span><span className="font-bold text-xl">{getTotal().toFixed(2)} $</span></div>
          <button onClick={handleCheckout} className="btn-primary w-full mt-4">Valider la commande</button>
          <button onClick={clearCart} className="btn-secondary w-full mt-2">Vider le panier</button>
        </div>
      </div>
    </div>
  );
}