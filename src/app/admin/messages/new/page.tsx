"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ArrowLeft, Search, User, Mail, Send, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  image?: string | null;
}

export default function NewMessagePage() {
  const { data: session } = useSession();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then(res => res.json())
      .then(data => setAllUsers(data));
  }, []);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers([]);
      return;
    }
    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setFilteredUsers([]);
    setSearchTerm("");
  };

  const handleSend = async () => {
    if (!selectedUser) {
      toast.error("Choisissez un destinataire");
      return;
    }
    if (!content.trim()) {
      toast.error("Écrivez un message");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId: selectedUser.id, content }),
    });
    if (res.ok) {
      toast.success("Message envoyé");
      setContent("");
      setSelectedUser(null);
      setSearchTerm("");
      setFilteredUsers([]);
    } else {
      toast.error("Erreur lors de l'envoi");
    }
    setLoading(false);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/messages" className="text-gray-500 hover:text-primary transition">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Envoyer un message à un client</h1>
      </div>

      {/* Carte principale */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Sélection du destinataire */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-3">Destinataire</h2>
          {selectedUser ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                  {(selectedUser.avatarUrl || selectedUser.image) ? (
                    <img src={selectedUser.avatarUrl || selectedUser.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="input-field pr-10"
                  />
                  <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button onClick={handleSearch} className="btn-primary">Rechercher</button>
              </div>

              {filteredUsers.length > 0 && (
                <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg divide-y divide-gray-200 dark:divide-gray-700 max-h-64 overflow-y-auto">
                  {filteredUsers.map(user => (
                    <button
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition flex items-center gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {(user.avatarUrl || user.image) ? (
                          <img src={user.avatarUrl || user.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-gray-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchTerm && filteredUsers.length === 0 && (
                <p className="text-center text-gray-500 py-4">Aucun utilisateur trouvé.</p>
              )}
            </div>
          )}
        </div>

        {/* Zone de message */}
        <div className="p-6">
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input-field"
            placeholder="Écrivez votre message ici..."
            disabled={!selectedUser}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSend}
              disabled={loading || !selectedUser || !content.trim()}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? "Envoi en cours..." : "Envoyer"}
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}