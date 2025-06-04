'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ResetPasswordConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  // No verificamos la sesión para permitir el restablecimiento de contraseña
  // desde el enlace de recuperación sin requerir una sesión activa

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError('');

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        // Traducir mensajes de error comunes de Supabase
        if (error.message === "New password should be different from the old password") {
          setMessage('La nueva contraseña debe ser diferente a la contraseña anterior');
        } else {
          setMessage(error.message);
        }
        setMessageType('error');
      } else {
        setMessage('Tu contraseña ha sido actualizada correctamente.');
        setMessageType('success');
        
        // Esperar 2 segundos y luego redirigir al home
        setTimeout(() => {
          router.push('/home');
        }, 2000);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error al actualizar la contraseña';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center text-gray-600">
      <div className="w-full max-w-md md:max-w-lg p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-2">
          Restablecer contraseña en <span className="font-bold">Interview<span className='italic'>Lab</span></span>
        </h1>
        <p className="text-sm text-center text-gray-500 mt-2 mb-6">
          Ingresa tu nueva contraseña para restablecer tu cuenta.
        </p>
        <form className="mt-8 space-y-8" onSubmit={handlePasswordUpdate}>
          <div className="space-y-4 rounded-md">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-4">
                Nueva contraseña
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-4">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-md border border-foreground/20 px-3 py-2 shadow-sm focus:border-foreground/50 focus:outline-none focus:ring-1 focus:ring-foreground/50"
              />
            </div>
          </div>

          {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
          {message && (
            <p className={`text-sm ${messageType === 'error' ? 'text-red-500' : 'text-gray-600'}`}>
              {message}
            </p>
          )}
          
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
                  Actualizando...
                </span>
              ) : (
                'Actualizar contraseña'
              )}
            </button>
          </div>
        </form>
        <p className="text-xs text-center text-gray-500 mt-6">
          ¿Recordaste tu contraseña?{' '}
          <Link href="/login" className="text-gray-800 underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </main>
  );
}