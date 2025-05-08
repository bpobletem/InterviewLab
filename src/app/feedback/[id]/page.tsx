'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Extender el objeto window para incluir la propiedad de depuración
declare global {
  interface Window {
    __DEBUG_DATA?: any;
  }
}

interface EvaluationCriterion {
  criterion: string;
  feedback: string;
  result?: 'success' | 'failure';
}

interface CriterionResult {
  result: 'success' | 'failure';
  rationale: string;
}

// La API devuelve directamente los detalles de la conversación
interface ConversationDetails {
  data?: any;
  analysis?: {
    evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
  };
  evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
}

export default function FeedbackPage() {
  const params = useParams();
  const id = params?.id;
  const [evaluationResults, setEvaluationResults] = useState<EvaluationCriterion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchConversationData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/conversation/${id}`);
          if (!response.ok) {
            if (response.status === 404) {
              throw new Error('Conversación no encontrada.');
            } else if (response.status === 400) {
              throw new Error('El formato del ID de conversación es inválido.');
            }
            throw new Error('Error al obtener los datos de la conversación.');
          }
          const details: ConversationDetails = await response.json();
          console.log('Datos recibidos:', details);
          
          // Guardar los datos completos para depuración
          window.__DEBUG_DATA = details;
          
          // Intentar diferentes estructuras posibles para encontrar los resultados de evaluación
          let results = null;
          
          // Estructura 1: details.data.analysis.evaluation_criteria_results
          if (details?.data?.analysis?.evaluation_criteria_results) {
            results = details.data.analysis.evaluation_criteria_results;
          }
          // Estructura 2: details.analysis.evaluation_criteria_results
          else if (details?.analysis?.evaluation_criteria_results) {
            results = details.analysis.evaluation_criteria_results;
          }
          // Estructura 3: details.evaluation_criteria_results
          else if (details?.evaluation_criteria_results) {
            results = details.evaluation_criteria_results;
          }
          // Estructura 4: details.data.evaluation_criteria_results
          else if (details?.data?.evaluation_criteria_results) {
            results = details.data.evaluation_criteria_results;
          }
          
          // Convertir los resultados a un formato uniforme si es un objeto en lugar de un array
          if (results && !Array.isArray(results)) {
            const formattedResults: EvaluationCriterion[] = Object.entries(results).map(([key, value]) => {
              if (typeof value === 'object' && value !== null && 'result' in value && 'rationale' in value) {
                // Es un objeto CriterionResult
                const criterionResult = value as CriterionResult;
                return {
                  criterion: key,
                  feedback: criterionResult.rationale,
                  result: criterionResult.result // Añadir el resultado para usarlo en la UI
                };
              } else {
                // Formato desconocido, intentar adaptarlo
                return {
                  criterion: key,
                  feedback: String(value)
                };
              }
            });
            setEvaluationResults(formattedResults);
          } else if (results && Array.isArray(results)) {
            setEvaluationResults(results);
          } else {
            setEvaluationResults([]); // No results found, but not an error
          }
        } catch (err: any) {
          setError(err.message || 'Ocurrió un error desconocido.');
        } finally {
          setLoading(false);
        }
      };

      fetchConversationData();
    }
  }, [id]);
  
  // Función para obtener el color de fondo según el resultado
  const getBackgroundColor = (item: EvaluationCriterion) => {
    if (item.result === 'success') {
      return 'bg-green-50 border-green-200';
    } else if (item.result === 'failure') {
      return 'bg-red-50 border-red-200';
    }
    return 'bg-white';
  };
  
  // Función para obtener el icono según el resultado
  const getResultIcon = (item: EvaluationCriterion) => {
    if (item.result === 'success') {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    } else if (item.result === 'failure') {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center py-16 px-4 font-sans">
        <div className="bg-gray-50 shadow-lg rounded-xl p-8 max-w-4xl w-full space-y-6 my-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
            Feedback de la Entrevista
          </h1>
          
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-800 font-medium">Cargando feedback...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center py-16 px-4 font-sans">
        <div className="bg-gray-50 shadow-lg rounded-xl p-8 max-w-4xl w-full space-y-6 my-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
            Feedback de la Entrevista
          </h1>
          
          <div className="w-full bg-white border border-red-200 rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">Error</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  // Función para mostrar la estructura de datos recibida
  const renderDataStructure = (data: any) => {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Estructura de Datos Recibida</h2>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Información técnica</div>
            </div>
          </div>
          <div className="p-5">
            <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  };
  
  // Mostramos los datos de depuración si no hay resultados

  if (!evaluationResults || evaluationResults.length === 0) {
    // Si no hay resultados, mostrar un mensaje y la estructura de datos para depuración
    return (
      <main className="min-h-screen bg-white flex items-center justify-center py-16 px-4 font-sans">
        <div className="bg-gray-50 shadow-lg rounded-xl p-8 max-w-4xl w-full space-y-6 my-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
            Feedback de la Entrevista
          </h1>
          
          <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Resultados de Evaluación</h2>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Sin resultados
                </div>
              </div>
            </div>
            <div className="p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800">No se Encontraron Resultados de Evaluación</h2>
              <p className="text-gray-700">No se pudieron encontrar criterios de evaluación para esta conversación.</p>
            </div>
          </div>
          
          {renderDataStructure(window.__DEBUG_DATA || {})}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-16 px-4 font-sans">
      <div className="bg-gray-50 shadow-lg rounded-xl p-8 max-w-4xl w-full space-y-6 my-16">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
          Feedback de la Entrevista
        </h1>
        
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Resultados de Evaluación</h2>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {evaluationResults.length} criterios evaluados
              </div>
            </div>
          </div>
          
          <div className="p-5">
            <div className="space-y-4">
              {evaluationResults.map((item, index) => (
                <div key={index} className={`border rounded-lg p-4 ${getBackgroundColor(item)}`}>
                  <div className="flex items-start">
                    {getResultIcon(item)}
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-medium text-gray-800">{item.criterion.charAt(0).toUpperCase() + item.criterion.slice(1)}</h2>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.result === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.result === 'success' ? 'Aprobado' : 'Necesita mejorar'}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-gray-700">{item.feedback}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}