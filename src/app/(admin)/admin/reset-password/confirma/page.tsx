"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function PasswordResetForm() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [codeReady, setCodeReady] = useState(false);

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setMessage("No se encontró el token de recuperación.");
      return;
    }

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setMessage("Código inválido o expirado.");
      } else {
        setCodeReady(true);
      }
    });
  }, [searchParams, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage("Error al actualizar la contraseña.");
    } else {
      setMessage("Contraseña actualizada. Redirigiendo al login...");
      setTimeout(() => router.push("/login"), 2500);
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Nueva contraseña</h1>
        <p className="text-sm text-center text-gray-900 mb-4">Ingresa tu nueva contraseña</p>

        {!codeReady && <p className="text-center text-red-600 text-sm">{message}</p>}

        {codeReady && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              required
              className="w-full px-4 py-2 border border-black text-gray-900 rounded text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gray-900 text-white rounded hover:bg-black disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Actualizando...
                </span>
              ) : (
                "Actualizar contraseña"
              )}
            </button>
            {message && <p className="text-center text-sm text-gray-600">{message}</p>}
          </form>
        )}
      </div>
    </main>
  );
}

export default function ConfirmaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <PasswordResetForm />
    </Suspense>
  );
}
