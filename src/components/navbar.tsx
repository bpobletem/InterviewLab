'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Obtener el usuario inicial
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[Navbar] Error fetching user:', error);
      } else {
        setUser(user);
      }
    };
    getUser();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Navbar] Auth state changed:', event);
      setUser(session?.user ?? null);
    });

    // Limpiar la suscripción al desmontar
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[Navbar] Error signing out:', error);
      } else {
        router.push('/');
        router.refresh(); // Sincronizar con el middleware
      }
    } catch (error) {
      console.error('[Navbar] Unexpected error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full border-b border-gray-200 px-6 py-3 flex justify-between items-center bg-white text-sm fixed top-0 z-10">
      <Link href="/home" className="font-semibold text-gray-800 hover:cursor-pointer">
        InterviewLab
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/home" className="text-gray-600 hover:text-black transition hover:cursor-pointer">
          Inicio
        </Link>
        {user ? (
          <div className="flex items-center gap-4">
            <Link href="/entrevista" className="text-gray-600 hover:text-black transition hover:cursor-pointer">
              Entrevista
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-500 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              aria-label="Cerrar sesión"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="text-gray-500 hover:text-black transition hover:cursor-pointer"
            aria-label="Iniciar sesión"
          >
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}