"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import ImageUpload from "@/components/ImageUpload";
import { Trash2, Edit, UserPlus, Mail, Phone } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image: string | null;
  email: string | null;
  phone: string | null;
}

export default function AdminTeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    role: "",
    bio: "",
    image: "",
    email: "",
    phone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch("/api/team");
    if (res.ok) {
      const data = await res.json();
      setMembers(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = editingId ? `/api/admin/team/${editingId}` : "/api/admin/team";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success(editingId ? "Membre modifié" : "Membre ajouté");
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", role: "", bio: "", image: "", email: "", phone: "" });
      fetchMembers();
    } else {
      toast.error("Erreur");
    }
    setSaving(false);
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    const res = await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Membre supprimé");
      fetchMembers();
    } else {
      toast.error("Erreur");
    }
  };

  const editMember = (member: Member) => {
    setForm({
      name: member.name,
      role: member.role,
      bio: member.bio || "",
      image: member.image || "",
      email: member.email || "",
      phone: member.phone || "",
    });
    setEditingId(member.id);
    setShowForm(true);
  };

  if (!session || session.user.role !== "admin") return <div>Accès refusé</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion de l'équipe</h1>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", role: "", bio: "", image: "", email: "", phone: "" }); }} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} /> Ajouter
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-lg font-semibold mb-4">{editingId ? "Modifier" : "Ajouter"} un membre</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nom</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Rôle</label>
              <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium">Bio</label>
              <textarea rows={3} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium">Photo</label>
              <ImageUpload onUpload={(url) => setForm({ ...form, image: url })} onRemove={() => setForm({ ...form, image: "" })} currentImage={form.image} label="Photo du membre" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email (contact)</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium">Téléphone (WhatsApp)</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" placeholder="2438xxxxxx" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary">{saving ? "Enregistrement..." : "Enregistrer"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="btn-secondary">Annuler</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p>Chargement...</p>
      ) : members.length === 0 ? (
        <p>Aucun membre.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48 bg-amber-100 dark:bg-gray-700">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Pas de photo</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                {member.bio && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{member.bio}</p>}
                <div className="flex flex-wrap gap-2 mt-3">
                  {member.email && (
                    <a href={`mailto:${member.email}`} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                      <Mail size={14} /> Email
                    </a>
                  )}
                  {member.phone && (
                    <a href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                      <Phone size={14} /> WhatsApp
                    </a>
                  )}
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => editMember(member)} className="btn-secondary text-sm px-3 py-1 flex items-center gap-1"><Edit size={14} /> Modifier</button>
                  <button onClick={() => deleteMember(member.id)} className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded flex items-center gap-1"><Trash2 size={14} /> Supprimer</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}