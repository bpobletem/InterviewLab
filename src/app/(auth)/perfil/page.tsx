'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaUser, FaCalendarAlt, FaUniversity, FaGraduationCap, FaStar } from 'react-icons/fa';

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
  institution_name: string;
  career_name: string;
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
    institution_name: 'DuocUC',
    career_id: 2,
    career_name: 'Analista programador computacional',
    authId: 'auth123'
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
    <main className="flex flex-col items-center py-10 px-4 min-h-screen bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
        Perfil de Usuario
      </h1>
      
      <div className="w-full max-w-7xl">
        {/* Sección de información personal */}
        <div className="bg-white/90 rounded-lg shadow-lg p-8 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar y nombre */}
            <div className="md:w-1/4 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 to-green-500 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <FaUser className="text-6xl text-gray-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 text-center">{profile.name}</h2>
              <p className="text-gray-600 text-center">{profile.email}</p>
            </div>
            
            {/* Información principal */}
            <div className="flex-1 mt-6 md:mt-0">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <FaUser className="text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Género</h3>
                    <p className="text-gray-800 font-medium">{profile.gender}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCalendarAlt className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de nacimiento</h3>
                    <p className="text-gray-800 font-medium">{formatDate(profile.birthday)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaUniversity className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Institución</h3>
                    <p className="text-gray-800 font-medium">{profile.institution_name || profile.institution_id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaGraduationCap className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Carrera</h3>
                    <p className="text-gray-800 font-medium">{profile.career_name || profile.career_id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de historial de entrevistas */}
        <div className="bg-white/90 rounded-lg shadow-lg p-8 border border-gray-100 transition-all duration-300 hover:shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-green-600">Historial de Entrevistas</span>
            </h2>
            <Link href="/entrevista" className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2">
              <span>Nueva Entrevista</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {interviews.filter(interview => interview.status !== 'pending').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {interviews
                .filter(interview => interview.status !== 'pending')
                .map((interview) => (
                <div key={interview.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-5px]">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(interview.status)}`}>
                        {translateStatus(interview.status)}
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(interview.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{interview.job_description}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{interview.resume}</p>
                    
                    {interview.score !== undefined && (
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 mr-2">
                          <FaStar className="text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Puntuación: <span className="font-bold">{interview.score}/5</span></p>
                        </div>
                      </div>
                    )}
                    
                    {interview.status === 'completed' && (
                      <div className="mt-4 text-right">
                        <Link href={`/feedback/${interview.id}`} className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-300">
                          Ver Feedback
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6 text-lg">No tienes entrevistas registradas.</p>
              <Link href="/entrevista" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                Comienza tu primera entrevista
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}