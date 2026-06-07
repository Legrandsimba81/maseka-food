"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [noteInput, setNoteInput] = useState({});

  const fetchOrders = async () => {
    const res = await fetch("/api/admin/orders");
    if (res.ok) setOrders(await res.json());
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (id, status, adminNote) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    if (res.ok) {
      toast.success(`Commande ${status === "confirmed" ? "confirmée" : "annulée"}`);
      fetchOrders();
    } else toast.error("Erreur");
  };

  const markPaid = async (id) => {
    const res = await fetch(`/api/admin/orders/${id}/pay`, { method: "POST" });
    if (res.ok) {
      toast.success("Payé par USSD");
      fetchOrders();
    } else toast.error("Erreur");
  };

  const sendNote = async (id) => {
    const note = noteInput[id];
    if (!note) return;
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: note }),
    });
    if (res.ok) {
      toast.success("Note envoyée");
      setNoteInput({ ...noteInput, [id]: "" });
      fetchOrders();
    } else toast.error("Erreur");
  };

  const deleteOrder = async (id) => {
    if (!confirm("Supprimer définitivement cette commande ?")) return;
    const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Commande supprimée");
      fetchOrders();
    } else toast.error("Erreur");
  };

  const deleteAllOrders = async () => {
    if (!confirm("⚠️ Supprimer TOUTES les commandes ? Action irréversible.")) return;
    const res = await fetch("/api/admin/orders/delete-all", { method: "DELETE" });
    if (res.ok) {
      toast.success("Toutes les commandes supprimées");
      fetchOrders();
    } else toast.error("Erreur");
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <button onClick={deleteAllOrders} className="btn-secondary bg-red-600 text-white">Tout supprimer</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {orders.map(order => (
          <div key={order.id} className="border p-4 mb-4 rounded">
            <p>Client: {order.user?.name} ({order.user?.email})</p>
            {order.items.map((item) => (
              <li key={item.id}>
                {item.product.name} x {item.quantity} = {(item.priceAtTime * item.quantity).toFixed(2)} €
              </li>
            ))}
            <p>Total: {order.totalAmount} $ - Statut: {order.status}</p>
            <p>Adresse de livraison : {order.deliveryAddress} - Heure: {order.deliveryTime}</p>
            {order.adminNote && <p className="text-sm text-gray-500">Note admin: {order.adminNote}</p>}
            {order.paymentStatus === "paid_by_ussd" && <p className="text-green-600">✅ Payé par USSD</p>}
            {order.status === "pending" && (
              <div className="flex gap-2 mt-2">
                <button onClick={() => updateStatus(order.id, "confirmed", noteInput[order.id])} className="bg-green-500 text-white px-2 py-1 rounded">Confirmer</button>
                <button onClick={() => updateStatus(order.id, "cancelled", noteInput[order.id])} className="bg-red-500 text-white px-2 py-1 rounded">Annuler</button>
              </div>
            )}
            {order.status === "confirmed" && order.paymentStatus !== "paid_by_ussd" && (
              <button onClick={() => markPaid(order.id)} className="bg-blue-500 text-white px-2 py-1 rounded mt-2">Marquer payé (USSD)</button>
            )}
            <div className="mt-2">
              <textarea
                placeholder="Ajouter une note"
                className="border p-1 w-full"
                value={noteInput[order.id] || ""}
                onChange={e => setNoteInput({ ...noteInput, [order.id]: e.target.value })}
              />
              <div className="flex gap-2 mt-1">
                <button onClick={() => sendNote(order.id)} className="bg-gray-500 text-white px-2 py-1 rounded">Envoyer note</button>
                <button onClick={() => deleteOrder(order.id)} className="bg-red-700 text-white px-2 py-1 rounded">Supprimer</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}