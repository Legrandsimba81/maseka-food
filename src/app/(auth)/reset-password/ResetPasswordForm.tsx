"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Mot de passe modifié ! Redirection...");
      setTimeout(() => router.push("/login"), 2000);
    } else {
      toast.error(data.error || "Erreur");
    }
    setLoading(false);
  };

  if (!validToken) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Lien invalide</h1>
          <p className="mt-2">Le lien de réinitialisation est incorrect ou a expiré.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nouveau mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="input-field mt-1"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirmer le mot de passe</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="input-field mt-1"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full"
      >
        {loading ? "Chargement..." : "Réinitialiser"}
      </button>
    </form>
  );
}