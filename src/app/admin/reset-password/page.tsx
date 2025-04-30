'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function AdminResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const institution_id = searchParams.get('institution_id');

  const handlePasswordChange = async () => {
    setMessage('');
    setMessageType('');

    if (newPassword !== confirmPassword) {
      setMessage('Las contraseñas no coinciden');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('La contraseña debe tener al menos 6 caracteres');
      setMessageType('error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
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
          router.push(`/dashboard/${institution_id}`);
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

  const volverAlDashboard = () => {
    router.push(`/dashboard/${institution_id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Cambiar contraseña de administrador</h1>

      <div className="w-full max-w-sm bg-white p-6 rounded shadow">
        <label className="block mb-2 text-sm font-medium text-gray-700">Nueva contraseña:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded shadow-sm mb-4 text-gray-800"
          placeholder="********"
        />

        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded shadow-sm mb-4 text-gray-800"
          placeholder="********"
        />

        <button
          onClick={handlePasswordChange}
          disabled={loading || !newPassword || !confirmPassword}
          className="w-full bg-gray-900 text-white py-2 rounded hover:bg-black transition hover:cursor-pointer"
        >
          {loading ? 'Cambiando...' : 'Cambiar contraseña'}
        </button>

        {message && (
          <p
            className={`mt-4 text-sm text-center ${
              messageType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        <button
          onClick={volverAlDashboard}
          className="mt-4 w-full text-sm underline text-gray-700 hover:text-black"
        >
          Volver al dashboard
        </button>
      </div>
    </main>
  );
}