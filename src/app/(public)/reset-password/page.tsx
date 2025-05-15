"use client";

import { useState } from "react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      setMessage("Hemos enviado un enlace para restablecer tu contraseña.");
    } else {
      setMessage("Hubo un error. Por favor, intenta nuevamente.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-white text-gray-800">
  <div className="w-full max-w-sm p-6 border border-gray-200 rounded-xl shadow-sm">
    <h1 className="text-xl font-semibold text-center mb-1">
      Recuperar contraseña
    </h1>
    <p className="text-sm text-center text-gray-500 mb-6">
      Ingresa tu correo para restablecer tu contraseña
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>
    </form>

    {message && (
      <p className="mt-4 text-sm text-center text-gray-600">{message}</p>
    )}
  </div>
</main>
  );
}
