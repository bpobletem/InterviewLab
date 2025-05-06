'use client';

import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const { institution_id } = useParams();

  return (
    <main className="flex flex-col items-center justify-center text-gray-800">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-4">Dashboard de Administración</h1>
        <p className="text-lg text-center mb-2">Aquí va el contenido del dashboard.</p>
        <p className="text-sm text-center text-gray-500 mb-6">Institución ID: {institution_id}</p>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-medium mb-3">Panel de Control</h2>
          <p className="text-sm text-gray-600 mb-4">Desde aquí puedes administrar tu institución en InterviewLab.</p>
          
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-gray-50 rounded border border-gray-200">
              <h3 className="font-medium text-sm">Estadísticas</h3>
              <p className="text-xs text-gray-500">Próximamente: Visualiza estadísticas de uso.</p>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}