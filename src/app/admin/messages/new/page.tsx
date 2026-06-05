"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function NewMessagePage() {
  const { data: session } = useSession();
  const [allUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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

  const selectUser = (user) => {
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
      toast.error("Erreur");
    }
    setLoading(false);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Envoyer un message à un client</h1>

      {selectedUser && (
        <div className="mb-4 p-2 bg-green-100 dark:bg-green-900 rounded flex justify-between items-center">
          <span>Destinataire : <strong>{selectedUser.name}</strong> ({selectedUser.email})</span>
          <button onClick={() => setSelectedUser(null)} className="text-red-600 text-sm">Changer</button>
        </div>
      )}

      {!selectedUser && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Rechercher par nom ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button onClick={handleSearch} className="btn-primary">Rechercher</button>
          </div>

          {filteredUsers.length > 0 && (
            <div className="mt-2 border rounded-lg overflow-hidden">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => selectUser(user)}
                  className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 border-b last:border-b-0"
                >
                  <span className="font-medium">{user.name}</span> - {user.email}
                </div>
              ))}
            </div>
          )}
          {searchTerm && filteredUsers.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">Aucun utilisateur trouvé.</p>
          )}
        </div>
      )}

      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="input-field"
        placeholder="Votre message..."
        disabled={!selectedUser}
      />

      <button
        onClick={handleSend}
        disabled={loading || !selectedUser || !content.trim()}
        className="btn-primary w-full mt-4"
      >
        {loading ? "Envoi..." : "Envoyer"}
      </button>
    </div>
  );
}