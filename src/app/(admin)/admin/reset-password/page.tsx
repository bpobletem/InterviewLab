'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';

function ResetPasswordForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');
  const [passwordError, setPasswordError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const institution_id = searchParams.get('institution_id');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setPasswordError('');

    if (!institution_id) {
      setMessage('ID de institución no encontrado en la URL.');
      setMessageType('error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, institutionId: institution_id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Error al actualizar la contraseña');
        setMessageType('error');
      } else {
        setMessage('Contraseña actualizada correctamente');
        setMessageType('success');
        setNewPassword('');
        setConfirmPassword('');

        // Esperar unos segundos y volver al dashboard
        setTimeout(() => {
          if (institution_id) {
            router.push(`/admin/dashboard/${institution_id}`);
          } else {
            router.push('/admin/login');
          }
        }, 2000);
      }
    } catch (error) {
      console.error(error);
      setMessage('Error inesperado al cambiar la contraseña');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center text-gray-600">
      <div className="w-full max-w-md md:max-w-lg p-8 bg-white border border-gray-200 rounded-xl shadow-sm">
        <h1 className="text-xl font-semibold text-center mb-2">
          Cambiar contraseña de administrador
        </h1>
        <p className="text-sm text-center text-gray-500 mt-2 mb-6">
          Ingresa tu nueva contraseña para actualizar tu cuenta.
        </p>
        <form className="mt-8 space-y-8" onSubmit={handlePasswordChange}>
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
              disabled={loading || !institution_id}
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
      </div>
    </main>
  );
}

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-gray-500">Cargando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}