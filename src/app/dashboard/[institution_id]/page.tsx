'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const { institution_id } = useParams();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Dashboard de Administración</h1>
        <p className="text-lg text-center mb-2">Aquí va el contenido del dashboard.</p>
        <p className="text-sm text-center text-gray-500 mb-6">Institución ID: {institution_id}</p>

        <Link href="/admin/reset-password">
          <button
            className="w-full py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-black transition hover:cursor-pointer"
          >
            Cambiar Contraseña
          </button>
        </Link>
      </div>
    </main>
  );
}