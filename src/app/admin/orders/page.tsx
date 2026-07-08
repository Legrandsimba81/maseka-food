"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { ChevronDown, ChevronUp, Store, Truck, NotepadText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending": return { label: "En attente", className: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    case "confirmed": return { label: "Confirmée", className: "bg-green-100 text-green-800 border-green-300" };
    case "cancelled": return { label: "Annulée", className: "bg-red-100 text-red-800 border-red-300" };
    default: return { label: status, className: "bg-gray-100 text-gray-800 border-gray-300" };
  }
};

const getDeliveryStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return { label: "En préparation", icon: <Clock size={14} className="text-yellow-500" /> };
    case "shipped": return { label: "En livraison", icon: <Truck size={14} className="text-blue-500" /> };
    case "delivered": return { label: "Livré", icon: <CheckCircle size={14} className="text-green-500" /> };
    default: return { label: status, icon: null };
  }
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [noteInput, setNoteInput] = useState({});
  const [showNote, setShowNote] = useState({}); // toggle pour chaque commande
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append("userName", searchTerm);
    if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
    const res = await fetch(`/api/admin/orders?${params.toString()}`);
    if (res.ok) setOrders(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = () => fetchOrders();
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    fetchOrders();
  };

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
      setShowNote({ ...showNote, [id]: false });
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

  const updateDeliveryStatus = async (id: string, deliveryStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryStatus }),
      });
      if (res.ok) {
        toast.success("Statut de livraison mis à jour");
        fetchOrders();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erreur");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    }
  };

  const toggleNote = (id) => {
    setShowNote(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Gestion des commandes</h1>
        <button onClick={deleteAllOrders} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">Tout supprimer</button>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Rechercher par nom ou email</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nom ou email..."
              className="input-field w-full"
            />
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium mb-1">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field w-full"
            >
              <option value="all">Tous</option>
              <option value="pending">En attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary">Rechercher</button>
            <button onClick={resetFilters} className="btn-secondary">Réinitialiser</button>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8">Chargement...</p>
      ) : orders.length === 0 ? (
        <p className="text-center py-8">Aucune commande trouvée.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map(order => {
            const statusBadge = getStatusBadge(order.status);
            const isOnSite = order.deliveryAddress?.startsWith("Table n°");
            const deliveryInfo = getDeliveryStatusLabel(order.deliveryStatus || "pending");

            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                {/* En-tête */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-gray-600 dark:text-gray-300">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 text-xs rounded-full border ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                    {isOnSite ? (
                      <span className="flex items-center gap-1 text-xs bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                        <Store size={12} /> Sur place
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                        <Truck size={12} /> Livraison
                      </span>
                    )}
                  </div>
                </div>

                {/* Corps */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    <span className="text-gray-500">Client</span>
                    <span className="font-medium truncate">{order.user?.name} ({order.user?.email})</span>
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold">{order.totalAmount} $</span>
                    <span className="text-gray-500">Adresse</span>
                    <span className="truncate">{order.deliveryAddress} {!isOnSite && `- ${order.deliveryTime}`}</span>
                  </div>

                  {/* Note admin (toujours visible si présente) */}
                  {order.adminNote && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
                      <NotepadText size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-700 dark:text-blue-300">Note admin</p>
                        <p className="text-blue-600 dark:text-blue-400">{order.adminNote}</p>
                      </div>
                    </div>
                  )}

                  {order.paymentStatus === "paid_by_ussd" && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5">
                      <CheckCircle size={16} /> Payé par USSD
                    </div>
                  )}

                  {/* Produits */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                    <ul className="space-y-1 text-sm">
                      {order.items?.map((item) => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.product.name} <span className="text-gray-400">x{item.quantity}</span></span>
                          <span>{(item.priceAtTime * item.quantity).toFixed(2)} $</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {order.status === "pending" && (
                      <>
                        <button onClick={() => updateStatus(order.id, "confirmed", noteInput[order.id])} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition">Confirmer</button>
                        <button onClick={() => updateStatus(order.id, "cancelled", noteInput[order.id])} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition">Annuler</button>
                      </>
                    )}
                    {order.status === "confirmed" && order.paymentStatus !== "paid_by_ussd" && (
                      <button onClick={() => markPaid(order.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition">Marquer payé (USSD)</button>
                    )}
                    <button onClick={() => deleteOrder(order.id)} className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm font-medium transition">Supprimer</button>
                  </div>

                  {/* Statut de livraison */}
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Livraison :</label>
                    <select
                      value={order.deliveryStatus || "pending"}
                      onChange={(e) => updateDeliveryStatus(order.id, e.target.value)}
                      className="input-field text-sm py-1 px-2 w-auto flex-1"
                    >
                      <option value="pending">En préparation</option>
                      <option value="shipped">En livraison</option>
                      <option value="delivered">Livré</option>
                    </select>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {deliveryInfo.icon} {deliveryInfo.label}
                    </span>
                  </div>

                  {/* Note toggle */}
                  <div className="mt-1">
                    <button
                      onClick={() => toggleNote(order.id)}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition"
                    >
                      <NotepadText size={16} />
                      {showNote[order.id] ? "Masquer la note" : "Ajouter/modifier une note"}
                      {showNote[order.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {showNote[order.id] && (
                      <div className="mt-2">
                        <textarea
                          placeholder="Note pour cette commande..."
                          className="border p-2 w-full rounded-xl text-sm"
                          rows={2}
                          value={noteInput[order.id] || ""}
                          onChange={e => setNoteInput({ ...noteInput, [order.id]: e.target.value })}
                        />
                        <button onClick={() => sendNote(order.id)} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded text-sm font-medium transition">
                          Envoyer note
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}