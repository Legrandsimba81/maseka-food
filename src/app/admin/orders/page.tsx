"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return { label: "En attente", className: "bg-yellow-100 text-yellow-800" };
    case "confirmed":
      return { label: "Confirmée", className: "bg-green-100 text-green-800" };
    case "cancelled":
      return { label: "Annulée", className: "bg-red-100 text-red-800" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-800" };
  }
};

const getDeliveryStatusLabel = (status: string) => {
  switch (status) {
    case "pending": return "En préparation";
    case "shipped": return "En livraison";
    case "delivered": return "Livré";
    default: return status;
  }
};

export default function AdminOrdersPage() {
  const { data: session } = useSession();
  const [orders, setOrders] = useState([]);
  const [noteInput, setNoteInput] = useState({});
  const [deliveryStatusInput, setDeliveryStatusInput] = useState({});
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
      fetchOrders();
    } else toast.error("Erreur");
  };

  const updateDeliveryStatus = async (id, newStatus) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryStatus: newStatus }),
    });
    if (res.ok) {
      toast.success(`Statut de livraison mis à jour : ${getDeliveryStatusLabel(newStatus)}`);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Commandes</h1>
        <button onClick={deleteAllOrders} className="btn-secondary bg-red-600 text-white">Tout supprimer</button>
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
            const currentDeliveryStatus = order.deliveryStatus || "pending";
            return (
              <div key={order.id} className="bg-white dark:bg-gray-800 border p-4 rounded-xl shadow relative">
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>
                </div>
                <div>
                  <p><strong>Client:</strong> {order.user?.name} ({order.user?.email})</p>
                  <p><strong>Total:</strong> {order.totalAmount} $</p>
                  <p><strong>Adresse:</strong> {order.deliveryAddress} - <strong>Heure:</strong> {order.deliveryTime}</p>
                  <p><strong>Statut livraison:</strong> {getDeliveryStatusLabel(currentDeliveryStatus)}</p>
                  {order.adminNote && <p className="text-sm text-gray-500">Note admin: {order.adminNote}</p>}
                  {order.paymentStatus === "paid_by_ussd" && <p className="text-green-600">✅ Payé par USSD</p>}
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 my-3">
                  <ul className="space-y-1">
                    {order.items?.map((item) => (
                      <li key={item.id} className="text-sm">
                        {item.product.name} x {item.quantity} = {(item.priceAtTime * item.quantity).toFixed(2)} $
                      </li>
                    ))}
                  </ul>
                </div>
                {order.status === "pending" && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => updateStatus(order.id, "confirmed", noteInput[order.id])} className="bg-green-500 text-white px-2 py-1 rounded">Confirmer</button>
                    <button onClick={() => updateStatus(order.id, "cancelled", noteInput[order.id])} className="bg-red-500 text-white px-2 py-1 rounded">Annuler</button>
                  </div>
                )}
                {order.status === "confirmed" && order.paymentStatus !== "paid_by_ussd" && (
                  <button onClick={() => markPaid(order.id)} className="bg-green-500 text-white px-2 py-1 rounded mt-2">Marquer payé (USSD)</button>
                )}
                {/* Mise à jour du statut de livraison (uniquement si commande confirmée) */}
                {order.status === "confirmed" && (
                  <div className="mt-3 flex gap-2 items-center">
                    <select
                      value={deliveryStatusInput[order.id] || currentDeliveryStatus}
                      onChange={e => setDeliveryStatusInput({ ...deliveryStatusInput, [order.id]: e.target.value })}
                      className="border rounded p-1 text-sm"
                    >
                      <option value="pending">En préparation</option>
                      <option value="shipped">En livraison</option>
                      <option value="delivered">Livré</option>
                    </select>
                    <button
                      onClick={() => updateDeliveryStatus(order.id, deliveryStatusInput[order.id] || currentDeliveryStatus)}
                      className="bg-blue-500 text-white px-2 py-1 rounded text-sm"
                    >
                      Mettre à jour livraison
                    </button>
                  </div>
                )}
                <div className="mt-3">
                  <textarea
                    placeholder="Ajouter une note"
                    className="border p-2 w-full rounded-xl"
                    rows={2}
                    value={noteInput[order.id] || ""}
                    onChange={e => setNoteInput({ ...noteInput, [order.id]: e.target.value })}
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => sendNote(order.id)} className="bg-blue-500 text-white px-3 py-1 rounded">Envoyer note</button>
                    <button onClick={() => deleteOrder(order.id)} className="bg-red-500 text-white px-3 py-1 rounded">Supprimer</button>
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