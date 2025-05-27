'use client';

import { useParams } from 'next/navigation';

export default function AdminDashboard() {
  const { institution_id } = useParams();

  return (
    <main className="flex flex-col items-center justify-center text-gray-800">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl font-bold text-center mb-4">Dashboard de Administración</h1>
        <p className="text-sm text-center text-gray-500 mb-6">Institución ID: {institution_id}</p>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 max-w-7xl min-h-[900px] flex items-center justify-center mx-auto">
          <iframe className='w-full h-[900px]' src="https://lookerstudio.google.com/embed/reporting/2aa60e81-3050-4bfc-a4b8-83004394464b/page/3o5KF" style={{ border: 0 }} allowFullScreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox" title="Embedded Looker Studio Report"></iframe>
        </div>
      </div>
    </main>
  );
}