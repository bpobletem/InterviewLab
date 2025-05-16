'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/unified-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al iniciar sesión');
        return;
      }

      if (data.session) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });
        window.location.href = data.redirectPath;
      } else {
        setError('Error al iniciar sesión: No se recibió una sesión válida');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center text-gray-600">
      <div className="w-full max-w-md md:max-w-lg p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-2">
          Inicia sesión en <span className="font-bold">Interview<span className='italic'>Lab</span></span>
        </h1>
        <form className="mt-8 space-y-8" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-4">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-4">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cargando...
                </span>
              ) : (
                'Ingresar'
              )}
            </button>
          </div>
        </form>
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link href="/register" className="text-gray-800 underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}