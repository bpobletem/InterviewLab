'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export default function AdminNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Obtener el usuario inicial
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[AdminNavbar] Error fetching user:', error);
      } else {
        console.log('[AdminNavbar] Usuario obtenido:', user);
        setUser(user);
        
        // Obtener el ID de la institución del administrador
        if (user) {
          try {
            const response = await fetch('/api/admin/validate', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (response.ok) {
              const data = await response.json();
              console.log('[AdminNavbar] Datos de institución obtenidos:', data);
              setInstitutionId(data.institution_id);
            } else {
              console.error('[AdminNavbar] Error en respuesta de validación:', response.status, await response.text());
            }
          } catch (error) {
            console.error('[AdminNavbar] Error fetching institution:', error);
          }
        }
      }
    };
    getUser();

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AdminNavbar] Auth state changed:', event);
      setUser(session?.user ?? null);
      
      // Si el usuario cierra sesión, limpiar el ID de la institución
      if (event === 'SIGNED_OUT') {
        setInstitutionId(null);
      } else if (event === 'SIGNED_IN' && session?.user) {
        // Intentar obtener el ID de institución cuando el usuario inicia sesión
        try {
          const response = await fetch('/api/admin/validate', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            console.log('[AdminNavbar] Datos de institución obtenidos después de inicio de sesión:', data);
            setInstitutionId(data.institution_id);
          } else {
            console.error('[AdminNavbar] Error en respuesta de validación después de inicio de sesión:', response.status, await response.text());
          }
        } catch (error) {
          console.error('[AdminNavbar] Error fetching institution after sign in:', error);
        }
      }
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
        console.error('[AdminNavbar] Error signing out:', error);
      } else {
        router.push('/admin/login');
        router.refresh(); // Sincronizar con el middleware
      }
    } catch (error) {
      console.error('[AdminNavbar] Unexpected error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="w-full border-b border-gray-200 px-6 py-3 flex justify-between items-center bg-white text-sm">
      <Link href={institutionId ? `/admin/dashboard/${institutionId}` : '/admin/login'} className="font-semibold text-gray-800 hover:cursor-pointer">
        InterviewLab <span className="text-xs font-normal bg-gray-200 px-2 py-1 rounded ml-1">Admin</span>
      </Link>
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            {institutionId ? (
              <>
                <Link 
                  href={`/admin/dashboard/${institutionId}`} 
                  className="text-gray-600 hover:text-black transition hover:cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link 
                  href={`/admin/reset-password?institution_id=${institutionId}`} 
                  className="text-gray-600 hover:text-black transition hover:cursor-pointer"
                >
                  Cambiar Contraseña
                </Link>
              </>
            ) : (
              <span className="text-gray-600">Cargando opciones...</span>
            )}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-gray-500 hover:text-black transition disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              aria-label="Cerrar sesión"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}