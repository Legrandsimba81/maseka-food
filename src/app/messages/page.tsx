"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string; image?: string | null; avatarUrl?: string | null };
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
            <div key={msg.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 relative">
              <div className="flex items-start gap-3 pr-16">
                <div className="flex-shrink-0">
                  {(msg.sender.avatarUrl || msg.sender.image) ? (
                    <img
                      src={msg.sender.avatarUrl || msg.sender.image}
                      alt={msg.sender.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    <strong>{msg.sender.name}</strong> <br/> - le {new Date(msg.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2">{msg.content}</p>
                </div>
              </div>
              <button
                onClick={() => deleteMessage(msg.id)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                aria-label="Supprimer"
              >
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}