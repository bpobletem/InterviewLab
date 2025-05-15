'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface EvaluationCriterion {
  criterion: string;
  feedback: string;
  result?: 'success' | 'failure' | 'unknown';
}

// Mapa de palabras sin acento a palabras con acento
const accentMap: Record<string, string> = {
  'interes': 'interés',
  'tecnica': 'técnica',
};

interface CriterionResult {
  result: 'success' | 'failure' | 'unknown';
  rationale: string;
}

// La API devuelve directamente los detalles de la conversación
interface ConversationDetails {
  data?: {
    analysis?: {
      evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
    };
    evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
  };
  analysis?: {
    evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
  };
  evaluation_criteria_results?: EvaluationCriterion[] | Record<string, CriterionResult>;
  [key: string]: unknown;
}

export default function FeedbackPage() {
  const params = useParams();
  const id = params?.id;
  const [evaluationResults, setEvaluationResults] = useState<EvaluationCriterion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvedCriteria, setApprovedCriteria] = useState(0);
  const [hasUnknownResults, setHasUnknownResults] = useState(false);

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
            } else if (response.status === 401) {
              throw new Error('Debes iniciar sesión para ver este feedback.');
            } else if (response.status === 403) {
              throw new Error('No tienes permiso para acceder a este feedback.');
            }
            throw new Error('Error al obtener los datos de la conversación.');
          }
          const details: ConversationDetails = await response.json();

          // Intentar diferentes estructuras posibles para encontrar los resultados de evaluación
          let results = null;

          console.log(details);

          // Estructura 1: details.data.analysis.evaluation_criteria_results
          if (details?.data?.analysis?.evaluation_criteria_results) {
            results = details.data.analysis.evaluation_criteria_results;
          }

          // Función para normalizar criterios con acentos
          const normalizeCriterion = (criterion: string): string => {
            // Convertir a minúsculas para comparación
            const lowerCriterion = criterion.toLowerCase();
            // Verificar si existe en el mapa de acentos
            const normalized = accentMap[lowerCriterion] || criterion;

            // Preservar la capitalización original (primera letra mayúscula si el original la tenía)
            if (criterion.length > 0 && criterion[0] === criterion[0].toUpperCase()) {
              return normalized.charAt(0).toUpperCase() + normalized.slice(1);
            }

            return normalized;
          };

          // Convertir los resultados a un formato uniforme si es un objeto en lugar de un array
          if (results && !Array.isArray(results)) {
            const formattedResults: EvaluationCriterion[] = Object.entries(results).map(([key, value]) => {
              // Normalizar el criterio para añadir acentos si es necesario
              const normalizedKey = normalizeCriterion(key);

              if (typeof value === 'object' && value !== null && 'result' in value && 'rationale' in value) {
                // Es un objeto CriterionResult
                const criterionResult = value as CriterionResult;
                return {
                  criterion: normalizedKey,
                  feedback: criterionResult.rationale,
                  result: criterionResult.result // Añadir el resultado para usarlo en la UI
                };
              } else {
                // Formato desconocido, intentar adaptarlo
                return {
                  criterion: normalizedKey,
                  feedback: String(value)
                };
              }
            });
            setEvaluationResults(formattedResults);
          } else if (results && Array.isArray(results)) {
            // Normalizar los criterios en el array también
            const normalizedResults = results.map(item => ({
              ...item,
              criterion: normalizeCriterion(item.criterion)
            }));
            setEvaluationResults(normalizedResults);
          } else {
            setEvaluationResults([]); // No results found, but not an error
          }

          // Filtrar resultados desconocidos y contar criterios aprobados
          if (Array.isArray(results)) {
            // Verificar si hay resultados desconocidos
            const hasUnknown = results.some(item => item.result === 'unknown');
            setHasUnknownResults(hasUnknown);
            
            // Filtrar resultados con estado conocido (success o failure)
            const filteredResults = results.filter(item => item.result === 'success' || item.result === 'failure');
            const approved = results.filter(item => item.result === 'success').length;
            setEvaluationResults(filteredResults);
            setApprovedCriteria(approved);
          } else if (results && typeof results === 'object') {
            // Verificar si hay resultados desconocidos
            const hasUnknown = Object.values(results).some(
              value => typeof value === 'object' && value !== null && 'result' in value && value.result === 'unknown'
            );
            setHasUnknownResults(hasUnknown);
            
            // Filtrar resultados con estado conocido (success o failure)
            const filteredResults = Object.entries(results)
              .filter(([_, value]) => 
                typeof value === 'object' && 
                value !== null && 
                'result' in value && 
                (value.result === 'success' || value.result === 'failure')
              )
              .map(([key, value]) => {
                const normalizedKey = normalizeCriterion(key);
                const criterionResult = value as CriterionResult;
                return {
                  criterion: normalizedKey,
                  feedback: criterionResult.rationale,
                  result: criterionResult.result
                };
              });
            
            const approved = Object.values(results).filter(
              value => typeof value === 'object' && value !== null && 'result' in value && value.result === 'success'
            ).length;
            
            setEvaluationResults(filteredResults);
            setApprovedCriteria(approved);
          }
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Ocurrió un error desconocido.');
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
      return 'bg-green-50';
    } else if (item.result === 'failure') {
      return 'bg-red-50';
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
      <main className="flex items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10">
            Feedback de la Entrevista
          </h1>

          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="flex justify-center mb-4">
              <svg className="animate-spin h-8 w-8 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-800 font-medium">Cargando feedback...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10">
            Feedback de la Entrevista
          </h1>

          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
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

  // Función para renderizar estrellas basadas en criterios aprobados
  const renderStars = (count: number) => {
    const totalStars = 5;
    return (
      <div className="flex justify-center space-x-1 mb-4">
        {[...Array(totalStars)].map((_, i) => (
          <svg
            key={i}
            className={`w-8 h-8 ${i < count ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Función para obtener mensaje basado en la cantidad de criterios aprobados
  const getFeedbackMessage = (count: number) => {
    if (count === 0) {
      return "Hay áreas importantes que necesitas mejorar. ¡No te desanimes! Revisa los comentarios y sigue practicando.";
    } else if (count === 1) {
      return "Has mostrado potencial en un área. Trabaja en los demás aspectos siguiendo las recomendaciones.";
    } else if (count === 2) {
      return "Vas por buen camino. Has aprobado algunos criterios, pero aún hay espacio para mejorar.";
    } else if (count === 3) {
      return "¡Buen trabajo! Has aprobado más de la mitad de los criterios. Sigue mejorando en las áreas señaladas.";
    } else if (count === 4) {
      return "¡Excelente desempeño! Estás muy cerca de la excelencia. Un poco más de práctica y estarás listo.";
    } else {
      return "¡Felicitaciones! Has aprobado todos los criterios. Tu entrevista fue excepcional.";
    }
  };

  // Función para obtener el color del mensaje según la cantidad de criterios aprobados
  const getFeedbackMessageColor = (count: number) => {
    if (count <= 1) return "text-red-600";
    if (count <= 3) return "text-yellow-600";
    return "text-green-600";
  };

  if (!evaluationResults || evaluationResults.length === 0) {
    // Si no hay resultados, mostrar un mensaje
    return (
      <main className="flex items-center justify-center px-4 font-sans">
        <div className="max-w-5xl w-full py-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10">
            Feedback de la Entrevista
          </h1>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-8 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Resultados de Evaluación</h2>
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Sin resultados
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
              <h2 className="text-xl font-semibold mb-2 text-gray-800">No pudimos evaluar tus respuestas correctamente.</h2>
              <p className="text-gray-700 mx-auto">Te recomendamos realizar otra entrevista utilizando respuestas más extensas para obtener un análisis más preciso de tus habilidades.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex items-center justify-center px-4 font-sans my-10">
      <div className="max-w-5xl w-full py-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-10">
          Feedback de la Entrevista
        </h1>

        {/* Estrellas y mensaje de feedback */}
        <div className="bg-white rounded-xl shadow-sm mb-8">
          <div className="px-8 pt-8">
            <h2 className="text-xl font-bold text-center text-gray-800">Desempeño General</h2>
          </div>
          <div className="p-8 text-center">
            {renderStars(approvedCriteria)}
            <p className={`text-lg font-medium ${getFeedbackMessageColor(approvedCriteria)}`}>
              {getFeedbackMessage(approvedCriteria)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Has aprobado {approvedCriteria} de 5 criterios de evaluación
            </p>
          </div>
        </div>

        {/* Mensaje de recomendación si hay resultados desconocidos */}
        {hasUnknownResults && (
          <div className="bg-yellow-50 rounded-xl p-8 mb-8 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Recomendación</h3>
                <div className="mt-2 text-sm text-yellow-800">
                  <p className="">
                    Algunos criterios no pudieron ser evaluados completamente. Te recomendamos realizar otra entrevista utilizando respuestas más extensas para obtener un análisis más preciso de tus habilidades.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Resultados de Evaluación</h2>
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {evaluationResults.length} criterios evaluados
            </div>
          </div>

          <div className="p-8">
            <div className="space-y-8">
              {evaluationResults.map((item, index) => (
                <div key={index} className={`rounded-xl p-6 ${getBackgroundColor(item)}`}>
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