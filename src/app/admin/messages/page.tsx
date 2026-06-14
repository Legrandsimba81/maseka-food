"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Plus, User } from "lucide-react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: {
    name: string;
    image?: string | null;
    avatarUrl?: string | null;
  };
}

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const res = await fetch("/api/admin/messages");
    if (res.ok) {
      const data = await res.json();
      setMessages(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Message supprimé");
      fetchMessages();
    } else {
      toast.error("Erreur");
    }
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;
  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Messages</h1>
        <Link href="/admin/messages/new" className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Écrire à un client
        </Link>
      </div>
      {messages.length === 0 ? (
        <p>Aucun message.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="border-2 border-gray-200 dark:border-gray-700 rounded-xl p-4 relative">
              <div className="flex items-center gap-3 pr-16">
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
                    <strong>{msg.sender.name}</strong> - le {new Date(msg.createdAt).toLocaleString()}
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