'use client';

import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const { institution_id } = useParams();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard de Administración</h1>
      <p className="text-lg mb-2">Aquí va el contenido del dashboard.</p>
      <p className="text-sm text-gray-500">Institución ID: {institution_id}</p>
    </main>
  );
}