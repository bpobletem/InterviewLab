'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { FaUser, FaCalendarAlt, FaUniversity, FaGraduationCap } from 'react-icons/fa';
import { Interview, PaginatedResponse } from '@/types/types';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInterviews, setTotalInterviews] = useState(0);
  const interviewsPerPage = 6; // Cambiar al numeor que ocuparemos en producción

  // Tracking para evitar doble carga
  const initialLoadComplete = useRef(false);
  
  // Cargar datos del perfil y entrevistas desde la API
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar entrevistas del usuario con paginación
  const fetchInterviews = useCallback(async (userId: string, page: number) => {
    if (!userId) return;
    
    setIsLoadingInterviews(true);
    try {
      const interviewsResponse = await fetch(`/api/users/${userId}/interview?page=${page}&limit=${interviewsPerPage}`);
      if (!interviewsResponse.ok) {
        throw new Error('Error al cargar las entrevistas');
      }
      
      const responseData = await interviewsResponse.json() as PaginatedResponse<Interview>;
      
      // Extraer datos y metadatos de paginación
      setInterviews(responseData.data);
      setTotalInterviews(responseData.pagination.total);
      setTotalPages(responseData.pagination.pages);
    } catch (err) {
      console.error('Error al cargar entrevistas:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoadingInterviews(false);
    }
  }, [interviewsPerPage]);

  // Cargar datos del perfil y las entrevistas iniciales
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoadingProfile(true);
      setError(null);
      try {
        // Obtener datos del perfil
        const profileResponse = await fetch('/api/profile');
        if (!profileResponse.ok) {
          throw new Error('Error al cargar el perfil');
        }
        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Cargar entrevistas iniciales
        if (profileData && profileData.id) {
          await fetchInterviews(profileData.id, 1);
          initialLoadComplete.current = true;
        }
      } catch (err) {
        console.error('Error al cargar datos del perfil:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfileData();
  }, [fetchInterviews]); // Añadiendo fetchInterviews como dependencia

  // Efecto separado para manejar cambios de página después de la carga inicial
  useEffect(() => {
    // Solo actualizar entrevistas cuando cambia la página DESPUÉS de la carga inicial
    if (profile?.id && initialLoadComplete.current && currentPage > 0) {
      fetchInterviews(profile.id, currentPage);
    }
  }, [currentPage, profile?.id, fetchInterviews]);

  // Función para formatear la fecha
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  // Función para cambiar de página
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  // Función para ir a la página anterior
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Función para ir a la página siguiente
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const isLoading = isLoadingProfile;

  return (
    <main className="flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-12">
        Perfil de Usuario
      </h1>
      
      {isLoading ? (
        <div className="w-full max-w-7xl flex justify-center items-center py-20">
          <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
            <p className="text-gray-600 text-lg">Cargando información del perfil...</p>
          </div>
        </div>
      ) : error ? (
        <div className="w-full max-w-7xl bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-600 text-lg mb-2">Error al cargar los datos</p>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : (
        <div className="w-full max-w-7xl">
        {/* Sección de información personal */}
        <div className="bg-white/90 rounded-lg shadow-sm p-8 mb-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar y nombre */}
            <div className="md:w-1/4 flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-blue-500 via-violet-600 to-pink-600 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <FaUser className="text-6xl text-gray-300" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mt-4 text-center">{profile?.name || 'Usuario'}</h2>
              <p className="text-gray-600 text-center">{profile?.email || ''}</p>
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
                    <p className="text-gray-800 font-medium">{profile?.gender || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FaCalendarAlt className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Fecha de nacimiento</h3>
                    <p className="text-gray-800 font-medium">{profile?.birthday ? formatDate(profile.birthday) : '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <FaUniversity className="text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Institución</h3>
                    <p className="text-gray-800 font-medium">{profile?.institution_name || profile?.institution_id || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg transition-all duration-300 hover:bg-gray-100">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                    <FaGraduationCap className="text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Carrera</h3>
                    <p className="text-gray-800 font-medium">{profile?.career_name || profile?.career_id || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sección de historial de entrevistas */}
        <div className="bg-white/90 rounded-lg shadow-sm p-8 border border-gray-100 transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Historial de Entrevistas
              </h2>
              {totalInterviews > 0 && (
                <p className="text-sm text-gray-500">
                  Mostrando página {currentPage} de {totalPages} ({totalInterviews} entrevista{totalInterviews !== 1 ? 's' : ''} en total)
                </p>
              )}
            </div>
            <Link href="/entrevista" className="px-5 py-2.5 bg-blue-500 hover:bg-blue-700 text-white rounded-md transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg flex items-center space-x-2">
              <span>Nueva Entrevista</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
          
          {isLoadingInterviews ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-600 mt-2">Cargando entrevistas...</p>
              </div>
            </div>
          ) : interviews && interviews.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {interviews.map((interview) => (
                <div key={interview.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-lg transform hover:translate-y-[-5px]">
                  <div className="p-5">
                    <div className="flex justify-end items-start mb-3">
                      <span className="text-sm text-gray-500">{formatDate(interview.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{interview.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{interview.job_description}</p>
                    
                    <div className="mt-4 text-right">
                      <Link href={`/feedback/${interview.id.toString()}`} className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors duration-300">
                        Ver Feedback
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
              
              {/* Controles de paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors hover:cursor-pointer"
                  >
                    &laquo; Anterior
                  </button>
                  
                  <div className="flex space-x-1">
                    {/* Mostrar un número limitado de botones de página para mejorar la experiencia cuando hay muchas páginas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNumber => {
                        // Siempre mostrar la primera página, la última página, la página actual y las páginas adyacentes
                        return pageNumber === 1 || 
                               pageNumber === totalPages || 
                               (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                      })
                      .map((number, index, filteredArray) => {
                        // Añadir indicadores de "..." para páginas intermedias no mostradas
                        const showEllipsisBefore = index > 0 && filteredArray[index - 1] !== number - 1;
                        const showEllipsisAfter = index < filteredArray.length - 1 && filteredArray[index + 1] !== number + 1;
                        
                        return (
                          <div key={number} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                            
                            <button
                              onClick={() => paginate(number)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:cursor-pointer ${currentPage === number ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                            >
                              {number}
                            </button>
                            
                            {showEllipsisAfter && (
                              <span className="px-2 text-gray-500">...</span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 rounded-md disabled:opacity-50 hover:bg-gray-300 transition-colors hover:cursor-pointer"
                  >
                    Siguiente &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-6 text-lg">No tienes entrevistas registradas.</p>
              <Link href="/entrevista" className="px-6 py-3 bg-blue-500 hover:bg-blue-700 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                Comienza tu primera entrevista
              </Link>
            </div>
          )}
        </div>
        </div>
      )}
    </main>
  );
}