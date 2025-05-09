'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndAdminStatus = async () => {
      const { data: { user: supabaseUser }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('[Navbar] Error fetching user:', userError);
        setUser(null);
        setIsAdmin(false);
        return;
      }
      setUser(supabaseUser);

      if (supabaseUser) {
        try {
          const response = await fetch('/api/auth/user-info');
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
          } else {
            console.error('[Navbar] Error fetching admin status:', response.statusText);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('[Navbar] Exception fetching admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    fetchUserAndAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Navbar] Auth state changed:', event);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserAndAdminStatus();
      } else {
        setIsAdmin(false);
      }
    });

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
    <nav className="w-full border-b border-gray-100 px-6 py-3 flex justify-between items-center bg-white/60 text-sm">
      <div className="max-w-7xl flex justify-between items-center w-full mx-auto">
        <Link href="/" className="text-md font-semibold bg-gradient-to-r from-blue-500 to-violet-500 text-transparent bg-clip-text hover:cursor-pointer">
          Interview
          <span className='italic'>Lab</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/home" className="text-gray-600 hover:text-black transition hover:cursor-pointer">
            Inicio
          </Link>
          {user && !isAdmin && (
            <Link href="/entrevista" className="text-gray-600 hover:text-black transition hover:cursor-pointer">
              Entrevista
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-4">
              {/* The Entrevista link is now conditionally rendered above based on isAdmin status */}
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
      </div>
    </nav>
  );
}