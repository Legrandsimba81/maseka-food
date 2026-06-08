"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
      // Marquer comme lus
      await fetch("/api/messages/mark-read", { method: "POST" });
      // Notifier la navbar pour rafraîchir le compteur
      window.dispatchEvent(new Event("messages-read"));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) fetchMessages();
  }, [session]);

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const res = await fetch(`/api/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Message supprimé");
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
      // Mettre à jour le compteur (re-fetch ou événement)
      window.dispatchEvent(new Event("messages-read"));
    } else {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (!session) return null;
  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
      {messages.length === 0 ? (
        <p>Aucun message.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow relative">
              <div className="pr-16">
                <p className="text-sm text-muted-foreground">
                  De : {msg.sender.name} - le {new Date(msg.createdAt).toLocaleString()}
                </p>
                <p className="mt-2">{msg.content}</p>
              </div>
              <button
                onClick={() => deleteMessage(msg.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                aria-label="Supprimer"
              >
                supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}