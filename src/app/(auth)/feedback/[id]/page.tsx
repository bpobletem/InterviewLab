'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Interfaz para el resultado de la entrevista esperado del nuevo endpoint
interface InterviewResultFromAPI {
  id: string; // ID del registro de feedback
  interview_id: string;
  claridadNota?: number;
  claridadRazon?: string;
  ejemplosNota?: number;
  ejemplosRazon?: string;
  interesNota?: number;
  interesRazon?: string;
  profesionalismoNota?: number;
  profesionalismoRazon?: string;
  tecnicaNota?: number;
  tecnicaRazon?: string;
  resultadoNota?: number; // Puntuación general (ej. 75 para 75%)
  resultadoRazon?: string; // Feedback general
  createdAt: string; // Mantener como string
  updatedAt: string; // Mantener como string
}

// Interfaz para los datos de evaluación procesados para la UI
interface ProcessedEvaluationCriterion {
  criterion: string;
  score: number;
  feedback: string;
  isApproved: boolean; // Campo para indicar si está aprobado (score >= 6)
}

// Mapa de palabras sin acento a palabras con acento
const accentMap: Record<string, string> = {
  'interes': 'interés',
  'tecnica': 'técnica',
  'claridad': 'claridad',
  'ejemplos': 'ejemplos',
  'profesionalismo': 'profesionalismo',
};

const POLLING_INTERVAL = 5000; // 5 segundos para reintentar
const APPROVAL_THRESHOLD_SCORE = 6; // Puntuación mínima para considerar un criterio como aprobado
const OVERALL_GOOD_MATCH_PERCENTAGE = 60; // Porcentaje para considerar un buen match general

// Lista de claves base de criterios para iterar
const CRITERIA_KEYS = ['tecnica', 'interes', 'claridad', 'ejemplos', 'profesionalismo'];

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string; // Este 'id' es el interview_id para la API

  const [interviewResult, setInterviewResult] = useState<InterviewResultFromAPI | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<ProcessedEvaluationCriterion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResultPending, setIsResultPending] = useState(false);
  const [approvedCriteriaCount, setApprovedCriteriaCount] = useState(0);
  const [pollingTimeoutId, setPollingTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const normalizeCriterionName = useCallback((criterionKey: string): string => {
    const lowerCriterion = criterionKey.toLowerCase();
    // Primero, intenta obtener el nombre base (ej. 'tecnica' de 'tecnicaNota')
    let baseName = lowerCriterion;
    if (baseName.endsWith('nota')) {
      baseName = baseName.substring(0, baseName.length - 4);
    } else if (baseName.endsWith('razon')) {
      baseName = baseName.substring(0, baseName.length - 5);
    }
    
    const normalized = accentMap[baseName] || baseName;
    // Capitalizar la primera letra
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }, []);

  const processInterviewData = useCallback((data: InterviewResultFromAPI) => {
    let finalEvaluationResults: ProcessedEvaluationCriterion[] = [];
    let currentApprovedCriteria = 0;

    CRITERIA_KEYS.forEach(key => {
      const score = data[`${key}Nota` as keyof InterviewResultFromAPI] as number | undefined;
      const rationale = data[`${key}Razon` as keyof InterviewResultFromAPI] as string | undefined;

      if (typeof score === 'number' && typeof rationale === 'string') {
        const isApproved = score >= APPROVAL_THRESHOLD_SCORE;
        if (isApproved) {
          currentApprovedCriteria++;
        }
        finalEvaluationResults.push({
          criterion: normalizeCriterionName(key),
          score: score,
          feedback: rationale,
          isApproved: isApproved,
        });
      }
    });
    
    setEvaluationResults(finalEvaluationResults);
    setApprovedCriteriaCount(currentApprovedCriteria);
    setInterviewResult(data); // Guardamos el resultado completo de la API
    setIsResultPending(false);
    setLoading(false);
  }, [normalizeCriterionName]);

  const fetchInterviewResult = useCallback(async (interviewId: string) => {
    if (pollingTimeoutId) clearTimeout(pollingTimeoutId);
    try {
      setLoading(true);
      setError(null);
      setIsResultPending(false);

      const response = await fetch(`/api/interview-result/${interviewId}`);

      if (response.status === 202) {
        setIsResultPending(true);
        setLoading(false);
        const timeoutId = setTimeout(() => fetchInterviewResult(interviewId), POLLING_INTERVAL);
        setPollingTimeoutId(timeoutId);
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = `Error ${response.status}: ${errorData.error || response.statusText || 'Error al obtener el feedback.'}`;
        if (response.status === 404) {
          errorMessage = 'Feedback no encontrado para esta entrevista.';
        }
        throw new Error(errorMessage);
      }

      const data: InterviewResultFromAPI = await response.json();
      processInterviewData(data);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido al cargar el feedback.');
      setLoading(false);
      setIsResultPending(false);
    }
  }, [processInterviewData, pollingTimeoutId]);

  useEffect(() => {
    if (id) {
      fetchInterviewResult(id);
    }
    return () => {
      if (pollingTimeoutId) clearTimeout(pollingTimeoutId);
    };
  }, [id, fetchInterviewResult]);

  const getBackgroundColor = (item: ProcessedEvaluationCriterion) => {
    return item.isApproved ? 'bg-green-50' : 'bg-red-50';
  };

  const getResultIcon = (item: ProcessedEvaluationCriterion) => {
    if (item.isApproved) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    );
  };

  if (loading && !isResultPending) {
    return (
      <main className="flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Cargando Feedback de la Entrevista...
          </h1>
          <div className="flex justify-center items-center mb-6">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600">Estamos recuperando los detalles de tu entrevista.</p>
        </div>
      </main>
    );
  }

  if (isResultPending) {
    return (
      <main className="flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Procesando Feedback...
          </h1>
          <div className="flex justify-center items-center mb-6">
            <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <p className="text-gray-600 mb-2">El feedback de tu entrevista aún se está generando.</p>
          <p className="text-gray-500 text-sm">Esto puede tardar unos momentos. La página se actualizará automáticamente.</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8 text-center bg-white/90 p-8 rounded-lg shadow-sm">
          <div className="flex justify-center items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-4">
            Error al Cargar el Feedback
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')} // Redirige a la página de inicio o a donde sea apropiado
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150 hover:cursor-pointer"
          >
            Volver al Inicio
          </button>
        </div>
      </main>
    );
  }

  if (!interviewResult || !evaluationResults) { // Simplificado, ya que evaluationResults puede ser []
    return (
      <main className="flex flex-col items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8 text-center">
           <div className="flex justify-center items-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Feedback No Disponible
          </h1>
          <p className="text-gray-600 mb-6">No se encontraron resultados de evaluación para esta entrevista o aún no se han procesado.</p>
          <button
            onClick={() => router.push('/')} // Redirige a la página de inicio
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150"
          >
            Volver al Inicio
          </button>
        </div>
      </main>
    );
  }

  const totalCriteria = evaluationResults.length;
  // Usar resultadoNota directamente si está disponible, sino calcularlo.
  const overallScorePercentage = typeof interviewResult.resultadoNota === 'number' 
    ? interviewResult.resultadoNota 
    : (totalCriteria > 0 ? (approvedCriteriaCount / totalCriteria) * 100 : 0);

  return (
    <main className="px-4 py-8 font-sans">
      <div className="max-w-7xl mx-auto bg-white/90 p-6 sm:p-10 rounded-xl shadow-sm border border-gray-200">
        <button
          onClick={() => router.back()} // Botón para volver a la página anterior
          className="mb-8 flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-150 font-medium hover:cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-8">
          Resultado de tu Entrevista
        </h1>

        {/* Resumen General */} 
        <div className="mb-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Resumen General</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-1">Criterios Evaluados:</p>
              <p className="text-3xl font-bold text-blue-600">{totalCriteria}</p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Criterios Superados: {APPROVAL_THRESHOLD_SCORE}</p>
              <p className="text-3xl font-bold text-green-600">{approvedCriteriaCount}</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-gray-600 mb-2">Puntuación General de Coincidencia:</p>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full ${overallScorePercentage >= OVERALL_GOOD_MATCH_PERCENTAGE ? 'bg-green-500' : 'bg-red-500'} transition-all duration-500 ease-out`}
                style={{ width: `${Math.max(overallScorePercentage, 5)}%` }} // Asegura un mínimo de ancho para visibilidad
              ></div>
            </div>
            <p className={`text-right text-2xl font-bold mt-2 ${overallScorePercentage >= OVERALL_GOOD_MATCH_PERCENTAGE ? 'text-green-600' : 'text-red-600'}`}>
              {overallScorePercentage.toFixed(0)}%
            </p>
          </div>
           {interviewResult.resultadoRazon && (
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Comentarios Generales del Entrevistador:</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{interviewResult.resultadoRazon}</p>
            </div>
          )}
        </div>

        {/* Resultados Detallados por Criterio */} 
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-8 pb-4">Desglose por Criterio</h2>
          {evaluationResults.length > 0 ? evaluationResults.map((item, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg ${getBackgroundColor(item)} transition-all duration-300 shadow-sm`}
            >
              <div className="flex items-start sm:items-center space-x-4">
                <div className="flex-shrink-0">
                  {getResultIcon(item)}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold mb-1 ${item.isApproved ? 'text-gray-800' : 'text-red-800'}`}>
                    {item.criterion}
                  </h3>
                  <p className={`text-sm ${item.isApproved ? 'text-gray-700' : 'text-red-700'} font-medium mb-2`}>
                    Puntuación: {item.score} / 10 - {item.isApproved ? 'Superado' : 'No Superado'}
                  </p>
                  <p className={`text-gray-700 ${item.isApproved ? 'text-opacity-90' : 'text-opacity-90'}`}>
                    {item.feedback}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-10">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-xl text-gray-500">No hay criterios de evaluación detallados para mostrar.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}