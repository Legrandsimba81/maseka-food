"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Message envoyé ! Nous vous répondrons rapidement.");
        setForm({ name: session?.user?.name || "", email: session?.user?.email || "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      toast.error("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Contactez-nous</h1>
      <div className="grid md:grid-cols-2 gap-8">
        {/* Informations de contact */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
          <div className="space-y-4">
            <div className="flex gap-3 items-start">
              <MapPin className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Adresse</p>
                <p className="text-gray-600 dark:text-gray-300">
                  Commune de Bulengera, Butembo,<br />
                  République Démocratique du Congo
                </p>

              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Phone className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Téléphone</p>
                <p className="text-gray-600 dark:text-gray-300">+33 1 23 45 67 89</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Mail className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-gray-600 dark:text-gray-300">contact@masekafood.com</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <Clock className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Horaires</p>
                <p className="text-gray-600 dark:text-gray-300">Lundi – Samedi : 7h – 20h<br />Dimanche : 8h – 13h</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15900.987654321!2d29.283333!3d0.150000!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMMKwMDknMDQuMCJOIDI5wrAxNyc1Ni4wIkU!5e0!3m2!1sfr!2scd!4v0000000000000" width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Carte"
            ></iframe>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nom</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sujet</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                required
                className="input-field"
              ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? "Envoi en cours..." : "Envoyer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}