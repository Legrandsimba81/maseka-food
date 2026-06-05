"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function AdminContactPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetch("/api/admin/contact")
        .then(res => res.json())
        .then(setMessages)
        .finally(() => setLoading(false));
    }
  }, [session, status]);

  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return <div className="text-center py-8">Accès réservé à l'administrateur</div>;
  }

  if (loading) return <div className="text-center py-8">Chargement...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages de contact</h1>
      <div className="space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
            <div className="flex justify-between">
              <div>
                <p><strong>{msg.name}</strong> ({msg.email})</p>
                <p className="text-sm text-muted-foreground">Sujet: {msg.subject}</p>
              </div>
              <p className="text-sm text-muted-foreground">{new Date(msg.createdAt).toLocaleString()}</p>
            </div>
            <p className="mt-2 whitespace-pre-wrap">{msg.message}</p>
          </div>
        ))}
        {messages.length === 0 && <p>Aucun message pour le moment.</p>}
      </div>
    </div>
  );
}