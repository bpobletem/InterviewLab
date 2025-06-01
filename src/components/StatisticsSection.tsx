'use client';

import { Interview, InterviewResultFromAPI } from '@/types/types';
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { FaChartBar, FaChevronDown } from 'react-icons/fa';

interface StatisticsSectionProps {
  userId: string;
}

interface AverageScore {
  criterion: string;
  score: number;
}

interface ScoreOverTime {
  date: string;
  score: number;
}

interface CriterionScoreOverTime {
  date: string;
  [key: string]: string | number;
}

const criteriaNames: Record<string, string> = {
  'tecnica': 'Técnica',
  'interes': 'Interés',
  'claridad': 'Claridad',
  'ejemplos': 'Ejemplos',
  'profesionalismo': 'Profesionalismo',
};

// Colores basados en la paleta del proyecto (gradientes from-blue-500 via-violet-600 to-pink-600)
const criteriaColors: Record<string, string> = {
  'tecnica': '#3b82f6',      // blue-500
  'interes': '#7ccf00',      // lime-500
  'claridad': '#a855f7',     // purple-500
  'ejemplos': '#FFC107',     // amber-500
  'profesionalismo': '#ec4899', // pink-500
  'resultado': '#6366f1',    // indigo-500
};

export default function StatisticsSection({ userId }: StatisticsSectionProps) {
  const [averageScores, setAverageScores] = useState<AverageScore[]>([]);
  const [overallScoreOverTime, setOverallScoreOverTime] = useState<ScoreOverTime[]>([]);
  const [criteriaScoresOverTime, setCriteriaScoresOverTime] = useState<CriterionScoreOverTime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    const fetchInterviewResults = async () => {
      if (!userId) return;
      
      setLoading(true);
      setError(null);
      setDataLoaded(false);
      
      try {
        // Obtener las entrevistas del usuario para estadísticas
        const interviewsResponse = await fetch(`/api/users/${userId}/interview?type=stats`);
        if (!interviewsResponse.ok) {
          throw new Error('Error al cargar las entrevistas');
        }
        
        const interviewsData = await interviewsResponse.json();
        const interviews = interviewsData.data;
        
        if (!interviews || interviews.length === 0) {
          setLoading(false);
          return;
        }
        
        // Obtener resultados de cada entrevista
        const resultsPromises = interviews.map(async (interview: Interview) => {
          try {
            const resultResponse = await fetch(`/api/interview-result/${interview.id}`);
            if (resultResponse.status === 202) {
              return null; // Resultado pendiente
            }
            if (!resultResponse.ok) {
              return null;
            }
            const result = await resultResponse.json();
            return {
              ...result,
              interviewDate: interview.created_at
            };
          } catch (err) {
            console.error(`Error al obtener resultado para entrevista ${interview.id}:`, err);
            return null;
          }
        });
        
        const results = (await Promise.all(resultsPromises)).filter(Boolean);
        
        if (results.length === 0) {
          setLoading(false);
          return;
        }
        
        processDataForCharts(results);
      } catch (err) {
        console.error('Error al cargar datos de estadísticas:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
        setDataLoaded(true);
      }
    };
    
    // Solo cargar datos cuando se expande la sección
    if (isExpanded && !dataLoaded) {
      fetchInterviewResults();
    }
  }, [userId, isExpanded, dataLoaded]);
  
  const processDataForCharts = (results: (InterviewResultFromAPI & { interviewDate: string })[]) => {
    // Calcular promedios por criterio
    const criteriaKeys = ['tecnica', 'interes', 'claridad', 'ejemplos', 'profesionalismo'];
    const criteriaScores: Record<string, number[]> = {};
    const resultadoScores: number[] = [];
    
    criteriaKeys.forEach(key => {
      criteriaScores[key] = [];
    });
    
    results.forEach(result => {
      criteriaKeys.forEach(key => {
        const scoreKey = `${key}Nota` as keyof typeof result;
        const score = result[scoreKey];
        if (typeof score === 'number' && score >= 0) {
          criteriaScores[key].push(score);
        }
      });
      
      if (typeof result.resultadoNota === 'number' && result.resultadoNota >= 0) {
        resultadoScores.push(result.resultadoNota);
      }
    });
    
    const avgScores: AverageScore[] = criteriaKeys.map(key => {
      const scores = criteriaScores[key];
      const avg = scores.length > 0 
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
        : 0;
      
      return {
        criterion: criteriaNames[key] || key,
        score: parseFloat(avg.toFixed(1))
      };
    });
    
    setAverageScores(avgScores);
    
    // Calcular evolución de puntuación general a lo largo del tiempo
    const sortedResults = [...results].sort((a, b) => {
      return new Date(a.interviewDate).getTime() - new Date(b.interviewDate).getTime();
    });
    
    const overallScores = sortedResults
      .filter(result => typeof result.resultadoNota === 'number' && result.resultadoNota > 0)
      .map(result => ({
        date: new Date(result.interviewDate).toLocaleDateString('es-ES'),
        score: result.resultadoNota as number // Aseguramos que sea number después del filtro
      }));
    
    setOverallScoreOverTime(overallScores);
    
    // Calcular evolución de puntuaciones por criterio a lo largo del tiempo
    const criteriaOverTime = sortedResults.map(result => {
      const entry: CriterionScoreOverTime = {
        date: new Date(result.interviewDate).toLocaleDateString('es-ES')
      };
      
      criteriaKeys.forEach(key => {
        const scoreKey = `${key}Nota` as keyof typeof result;
        const score = result[scoreKey];
        if (typeof score === 'number' && score > 0) {
          entry[criteriaNames[key] || key] = score;
        }
      });
      
      return entry;
    });
    
    setCriteriaScoresOverTime(criteriaOverTime);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  // Renderiza el contenido según el estado (cargando, error, sin datos o gráficos)
  const renderContent = () => {
    if (!isExpanded) {
      return null;
    }
    
    if (loading) {
      return (
        <div className="w-full flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 mt-2">Cargando estadísticas...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full bg-red-50 p-6 rounded-lg border border-red-200 text-center">
          <p className="text-red-600 text-lg mb-2">Error al cargar las estadísticas</p>
          <p className="text-red-500">{error}</p>
        </div>
      );
    }

    if (averageScores.length === 0) {
      return (
        <div className="w-full bg-gray-50 p-6 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 text-lg">No hay suficientes datos para mostrar estadísticas.</p>
          <p className="text-gray-500 mt-2">Completa más entrevistas para ver tus estadísticas de rendimiento.</p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 space-y-10">
        {/* Gráfico de barras: muestra el promedio de cada criterio de evaluación */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Puntuación Promedio por Criterio</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={averageScores}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="criterion" />
                <YAxis domain={[0, 10]} />
                <RechartsTooltip />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" name="Puntuación" isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Gráfico de área: muestra la evolución de la puntuación general en el tiempo */}
        {overallScoreOverTime.length > 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Evolución de Puntuación General</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={overallScoreOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Area type="monotone" dataKey="score" stroke="#6366f1" fill="rgba(99, 102, 241, 0.2)" name="Puntuación General" isAnimationActive={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* Gráfico de líneas: muestra la evolución de cada criterio a lo largo del tiempo */}
        {criteriaScoresOverTime.length > 1 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Evolución por Criterio</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={criteriaScoresOverTime}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <RechartsTooltip />
                  <Legend />
                  {Object.entries(criteriaNames).map(([key, name]) => (
                    <Line 
                      key={key}
                      type="monotone" 
                      dataKey={name} 
                      stroke={criteriaColors[key] || '#000'} 
                      activeDot={{ r: 8 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white/90 rounded-lg shadow-sm border border-gray-100 hover:shadow-lg overflow-hidden">
      {/* Cabecera con botón para expandir/colapsar la sección */}
      <button 
        onClick={toggleExpand}
        className="w-full px-8 py-6 flex items-center justify-between text-left focus:outline-none group"
        aria-expanded={isExpanded}
        aria-controls="statistics-content"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-full ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'} transition-colors duration-300`}>
            <FaChartBar className="text-lg" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Rendimiento</h2>
        </div>
        <div className={`${isExpanded ? 'rotate-180' : 'rotate-0'}`}>
          <FaChevronDown className="text-gray-500 group-hover:text-blue-500 hover:cursor-pointer transition-colors" />
        </div>
      </button>
      
      {/* Indicador visual de sección expandida */}
      <div className={`h-0.5 bg-gradient-to-r from-blue-500 via-violet-600 to-pink-600 ${isExpanded ? 'scale-x-100' : 'scale-x-0'}`}></div>
      
      {/* Contenedor de gráficos con animación */}
      <div 
        id="statistics-content"
        className={`overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 p-8' : 'max-h-0 opacity-0 p-0'}`}
      >
        {renderContent()}
      </div>
    </div>
  );
}