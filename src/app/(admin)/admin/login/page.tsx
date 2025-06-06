'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Auth guard - verificar si hay una sesión activa
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          // Si hay una sesión activa, verificar si es administrador
          const res = await fetch('/api/admin/validate', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (res.ok) {
            const validationData = await res.json();
            // Redirigir al dashboard si es un admin válido
            router.push(`/admin/dashboard/${validationData.institution_id}`);
            return;
          }
          // Si no es admin, cerrar sesión
          await supabase.auth.signOut();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

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

        router.push(data.redirectPath);
      } else {
        setError('Error al iniciar sesión: No se recibió una sesión válida');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error durante el inicio de sesión';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <main className="flex items-center justify-center bg-white text-gray-800">
        <div className="flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center text-gray-800">
      <div className="w-full max-w-sm md:max-w-md p-6 border border-gray-200 bg-white/80 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-1">
          Panel de Administración <span className="font-bold text-gray-900">InterviewLab</span>
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">Acceso exclusivo para administradores</p>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium">
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
                className="mt-1 block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-center items-center">
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 transition hover:cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
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
          ¿No eres administrador?{' '}
          <Link href="/login" className="text-gray-800 underline">
            Acceso de usuario
          </Link>
        </p>
      </div>
    </main>
  );
}