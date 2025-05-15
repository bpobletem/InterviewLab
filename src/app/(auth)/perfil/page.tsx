'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Interview {
  id: number;
  created_at: string;
  job_description: string;
  resume: string;
  user_id: string;
  status: 'completed' | 'pending' | 'cancelled';
  score?: number;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  gender: string;
  birthday: string;
  institution_id: number;
  career_id: number;
  authId: string;
}

export default function ProfilePage() {
  // Estado para almacenar los datos del perfil y entrevistas
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user123',
    name: 'Sebastian Monjes',
    email: 'seb.monjes@duocuc.cl',
    gender: 'Masculino',
    birthday: '2001-03-23',
    institution_id: 1,
    career_id: 2,
    authId: 'auth123',
  });

  const [interviews, setInterviews] = useState<Interview[]>([
    {
      id: 1,
      created_at: '2023-10-15',
      job_description: 'Desarrollador Frontend Senior en TechSolutions Inc.',
      resume: 'Experiencia en React y TypeScript',
      user_id: 'user123',
      status: 'completed',
      score: 3
    },
    {
      id: 2,
      created_at: '2023-11-20',
      job_description: 'Ingeniero de Software en Innovate Systems',
      resume: 'Experiencia en desarrollo backend',
      user_id: 'user123',
      status: 'completed',
      score: 2
    },
    {
      id: 3,
      created_at: '2023-12-05',
      job_description: 'Desarrollador Full Stack en Digital Creators',
      resume: 'Experiencia en MERN stack',
      user_id: 'user123',
      status: 'pending'
    }
  ]);

  // En una implementación real, aquí se cargarían los datos desde una API
  useEffect(() => {
    // Simulación de carga de datos
    // En producción: 
    // fetch('/api/user').then(res => res.json()).then(data => setProfile(data));
    // fetch('/api/interviews').then(res => res.json()).then(data => {
    //   // Asegurarse de que los datos tienen el formato correcto
    //   const formattedInterviews = data.map((interview: any) => ({
    //     ...interview,
    //     id: interview.id,
    //     created_at: interview.created_at,
    //     job_description: interview.job_description,
    //     resume: interview.resume,
    //     user_id: interview.user_id,
    //     status: interview.status || 'pending',
    //     score: interview.score
    //   }));
    //   setInterviews(formattedInterviews);
    // });
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener el color según el estado de la entrevista
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para traducir el estado
  const translateStatus = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <main className="flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
        Perfil de Usuario
      </h1>
      
      <div className="w-full max-w-7xl">
        {/* Sección de información personal */}
        <div className="bg-white/80 rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Información principal */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800">{profile.name}</h2>
              <p className="text-gray-600 mb-2">{profile.email}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Género</h3>
                  <p className="text-gray-800">{profile.gender}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fecha de nacimiento</h3>
                  <p className="text-gray-800">{formatDate(profile.birthday)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID de institución</h3>
                  <p className="text-gray-800">{profile.institution_id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">ID de carrera</h3>
                  <p className="text-gray-800">{profile.career_id}</p>
                </div>
              </div>
            </div>
            
            {/* Botón de editar perfil */}
            <button className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
              Editar Perfil
            </button>
          </div>
        </div>
        
        {/* Sección de historial de entrevistas */}
        <div className="bg-white/80 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Historial de Entrevistas</h2>
            <Link href="/entrevista" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
              Nueva Entrevista
            </Link>
          </div>
          
          {interviews.filter(interview => interview.status !== 'pending').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción del puesto</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {interviews
                    .filter(interview => interview.status !== 'pending')
                    .map((interview) => (
                    <tr key={interview.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(interview.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{interview.job_description}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                          {translateStatus(interview.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {interview.score !== undefined ? `${interview.score}/5` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {interview.status === 'completed' && (
                          <Link href={`/feedback/${interview.id}`} className="text-blue-600 hover:text-blue-900 mr-4">
                            Ver Feedback
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No tienes entrevistas registradas.</p>
              <Link href="/entrevista" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                Comienza tu primera entrevista
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}