'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, memo, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink = memo(function NavLink({ href, children, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
      onClick={onClick}
    >
      <span>{children}</span>
      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
    </Link>
  );
});

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { user, isAdmin, institutionId, isLoading, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
      router.refresh(); // Sincronizar con el middleware
    } catch (error) {
      console.error('[Navbar] Unexpected error during logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout, router]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  // Avoid re-renders when switching tabs by memoizing rendering logic
  const renderNavLinks = useCallback(() => {
    if (isLoading) return null;
    
    if (user && !isAdmin) {
      return (
        <>
          <NavLink href="/home">Inicio</NavLink>
          <NavLink href="/entrevista">Entrevista</NavLink>
        </>
      );
    }
    
    if (user && isAdmin && institutionId) {
      return (
        <>
          <NavLink href={`/admin/dashboard/${institutionId}`}>Dashboard</NavLink>
          <NavLink href={`/admin/reset-password?institution_id=${institutionId}`}>Cambiar contraseña</NavLink>
        </>
      );
    }
    
    if (!user) {
      return <NavLink href="/home">Inicio</NavLink>;
    }
    
    return null;
  }, [user, isAdmin, institutionId, isLoading]);

  const renderAuthLinks = useCallback(() => {
    if (isLoading) return null;
    
    if (user) {
      return (
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="text-gray-500 hover:gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed relative group hover:cursor-pointer"
          aria-label="Cerrar sesión"
        >
          <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
        </button>
      );
    } else {
      return (
        <NavLink href="/login">Iniciar sesión</NavLink>
      );
    }
  }, [user, isLoading, isLoggingOut, handleLogout]);

  return (
    <nav className="w-full border-b border-gray-100 px-6 py-3 flex justify-between items-center bg-white/60 text-sm backdrop-blur-md">
      <div className="max-w-7xl flex justify-between items-center w-full mx-auto">
        <Link href="/" className="text-lg font-semibold text-gray-700 hover:text-transparent hover:bg-gradient-to-r hover:from-blue-500 hover:to-violet-500 hover:bg-clip-text transition-colors duration-500 hover:cursor-pointer ease-in-out tracking-tighter px-2">
          Interview
          <span className='italic'>Lab</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {/* Regular user navigation */}
          {user && !isAdmin && !isLoading && (
            <>
              <Link
                href="/home"
                className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
              >
                <span>Inicio</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href="/entrevista"
                className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
              >
                <span>Entrevista</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href="/perfil"
                className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
              >
                <span>Perfil</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
            </>
          )}
          
          {/* Admin navigation */}
          {user && isAdmin && institutionId && !isLoading && (
            <>
              <Link
                href={`/admin/dashboard/${institutionId}`}
                className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
              >
                <span>Dashboard</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
              <Link
                href={`/admin/reset-password?institution_id=${institutionId}`}
                className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
              >
                <span>Cambiar contraseña</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </Link>
            </>
          )}
          
          {/* Non-authenticated user */}
          {!user && !isLoading && (
            <Link
              href="/home"
              className="text-gray-600 hover:gray-800 transition relative group hover:cursor-pointer"
            >
              <span>Inicio</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
          )}
          
          {/* Authentication links */}
          {!isLoading && user ? (
            <div className="flex items-center gap-6">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="text-gray-500 hover:gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed relative group hover:cursor-pointer"
                aria-label="Cerrar sesión"
              >
                <span>{isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-gray-500 hover:gray-800 transition relative group hover:cursor-pointer"
              aria-label="Iniciar sesión"
            >
              <span>Iniciar sesión</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 transition-all duration-300 ease-out group-hover:w-full"></span>
            </Link>
          )}
          {renderNavLinks()}
          {renderAuthLinks()}
        </div>
        
        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5 focus:outline-none"
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
        >
          <span className={`block w-6 h-0.5 bg-gray-600 transform transition duration-300 ease-in-out ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transition duration-300 ease-in-out ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block w-6 h-0.5 bg-gray-600 transform transition duration-300 ease-in-out ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-[60px] left-0 right-0 bg-white/95 backdrop-blur-md shadow-md transition-all duration-300 ease-in-out z-50 border-b border-gray-100 ${isMenuOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0 invisible'}`}>
        <div className="flex flex-col px-6 py-4 space-y-4">
          {/* Regular user navigation */}
          {user && !isAdmin && !isLoading && (
            <>
              <Link
                href="/home"
                className="text-gray-600 hover:gray-800 transition py-2 hover:cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/entrevista"
                className="text-gray-600 hover:gray-800 transition py-2 hover:cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrevista
              </Link>
            </>
          )}
          
          {/* Admin navigation */}
          {user && isAdmin && institutionId && !isLoading && (
            <>
              <Link
                href={`/admin/dashboard/${institutionId}`}
                className="text-gray-600 hover:gray-800 transition py-2 hover:cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href={`/admin/reset-password?institution_id=${institutionId}`}
                className="text-gray-600 hover:gray-800 transition py-2 hover:cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Cambiar contraseña
              </Link>
            </>
          )}
          
          {/* Non-authenticated user */}
          {!user && !isLoading && (
            <Link
              href="/home"
              className="text-gray-600 hover:gray-800 transition py-2 hover:cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
            >
              Inicio
            </Link>
          )}
          
          {/* Authentication links */}
          {!isLoading && user ? (
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
              className="text-gray-500 hover:gray-800 transition py-2 text-left disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              aria-label="Cerrar sesión"
            >
              {isLoggingOut ? 'Cerrando...' : 'Cerrar sesión'}
            </button>
          ) : (
            <Link
              href="/login"
              className="text-gray-500 hover:gray-800 transition py-2 hover:cursor-pointer"
              aria-label="Iniciar sesión"
              onClick={() => setIsMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default memo(Navbar);