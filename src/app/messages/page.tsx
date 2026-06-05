"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string };
}

export default function MessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetch("/api/messages")
      .then(res => res.json())
      .then(setMessages);
  }, []);

  if (!session) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Mes messages</h1>
      {messages.length === 0 ? (
        <p>Aucun message.</p>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <p className="text-sm text-muted-foreground">
                De : {msg.sender.name} - le {new Date(msg.createdAt).toLocaleString()}
              </p>
              <p className="mt-2">{msg.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}