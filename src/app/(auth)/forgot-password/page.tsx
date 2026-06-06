"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setSent(true);
      toast.success(data.message);
    } else {
      toast.error(data.error || "Erreur");
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Email envoyé</h2>
          <p>Vérifiez votre boîte de réception (ou vos spams) pour réinitialiser votre mot de passe.</p>
          <Link href="/login" className="text-primary underline mt-4 inline-block">Retour à la connexion</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Mot de passe oublié</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field mb-4"
            required
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Envoi..." : "Envoyer le lien"}
          </button>
        </form>
        <p className="text-center mt-4">
          <Link href="/login" className="text-primary underline">Retour à la connexion</Link>
        </p>
      </div>
    </div>
  );
}