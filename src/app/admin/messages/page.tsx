"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    const res = await fetch("/api/admin/messages");
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const res = await fetch("/api/admin/messages", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Message supprimé");
      fetchMessages();
    } else {
      toast.error("Erreur");
    }
  };

  if (!session || session.user.role !== "admin") return <div className="p-6">Accès refusé</div>;
  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messages de contact</h1>
      {messages.length === 0 ? (
        <p>Aucun message.</p>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p><strong>{msg.name}</strong> ({msg.email})</p>
                  <p className="text-sm text-muted-foreground">Sujet : {msg.subject}</p>
                  <p className="mt-2 whitespace-pre-wrap">{msg.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">Le {new Date(msg.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => deleteMessage(msg.id)} className="text-red-600 hover:text-red-800 text-sm">Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}