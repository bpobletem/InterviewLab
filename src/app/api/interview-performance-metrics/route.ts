import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define la estructura para los resultados de cada criterio
interface CriterionResultOutput {
  name: string;
  score: number;
}

// Define la estructura para la evaluación completa de una entrevista
interface InterviewEvaluation {
  interview_id: string;
  user_id: string;
  institution_id: number;
  career_id: number;
  area_id: number;
  gender: string;
  age: number;
  extracted_at: Date;
  criteriaResults: CriterionResultOutput[]; // Arreglo de objetos { name, score }
  // También podrías considerar:
  // criteriaScores: Record<string, number>; // Objeto { 'Claridad': 8, 'Profesionalismo': 9 }
}

const PREDEFINED_CRITERIA_NORMALIZED: Record<string, string> = {
  claridad: 'Claridad',
  profesionalismo: 'Profesionalismo',
  tecnica: 'Técnica',
  interes: 'Interés',
  ejemplos: 'Ejemplos'
};

const USER_CRITERIA_KEYS = Object.keys(PREDEFINED_CRITERIA_NORMALIZED);

type ScorePropertyKeys = 'claridadNota' | 'profesionalismoNota' | 'tecnicaNota' | 'interesNota' | 'ejemplosNota';

const CRITERIA_SCORE_MAP: Record<string, ScorePropertyKeys> = {
    claridad: 'claridadNota',
    profesionalismo: 'profesionalismoNota',
    tecnica: 'tecnicaNota',
    interes: 'interesNota',
    ejemplos: 'ejemplosNota'
};

// Función para validar la API key
const validateApiKey = (request: NextRequest): boolean => {
  // Obtener la API key del header 'x-api-key'
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.API_KEY;
  
  if (!apiKey || !validApiKey) {
    return false;
  }
  
  return apiKey === validApiKey;
};

export async function GET(request: NextRequest) {
  // Verificar la API key
  if (!validateApiKey(request)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing API key' },
      { status: 401 }
    );
  }
  
  try {
    const interviewResults = await prisma.interviewResult.findMany({
      include: {
        interview: {
          include: {
            user: {
              include: {
                institution: true,
                career: {
                  include: {
                    area: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Cambiamos el tipo del arreglo de salida
    const allInterviewEvaluations: InterviewEvaluation[] = [];
    const now = new Date();

    for (const result of interviewResults) {
      if (!result.interview?.user?.career?.area || !result.interview?.user?.institution) {
        console.warn(`Skipping interviewResult ${result.id} due to missing associated user, career, area, or institution data.`);
        continue;
      }

      const user = result.interview.user;
      const birthDate = user.birthday;
      const ageInMilliseconds = now.getTime() - new Date(birthDate).getTime();
      const ageInYears = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));

      // Array para almacenar los resultados de los criterios de ESTA entrevista
      const criteriaResultsForThisInterview: CriterionResultOutput[] = [];
      // Opcional: objeto para los scores por nombre (si prefieres un acceso directo)
      // const criteriaScoresForThisInterview: Record<string, number> = {};

      for (const criterionKey of USER_CRITERIA_KEYS) {
        const criterionDisplayName = PREDEFINED_CRITERIA_NORMALIZED[criterionKey];
        const scoreKey = CRITERIA_SCORE_MAP[criterionKey];
        const criterionScore = result[scoreKey];

        if (criterionScore !== null) {
          criteriaResultsForThisInterview.push({
            name: criterionDisplayName,
            score: criterionScore,
          });
          // Opcional:
          // criteriaScoresForThisInterview[criterionDisplayName] = criterionScore;
        }
      }

      // SOLO si hay al menos un criterio evaluado para esta entrevista
      if (criteriaResultsForThisInterview.length > 0) {
        allInterviewEvaluations.push({
          interview_id: result.interview_id,
          user_id: user.id,
          institution_id: Number(user.institution_id),
          career_id: Number(user.career_id),
          area_id: Number(user.career.area.id),
          gender: user.gender,
          age: ageInYears,
          extracted_at: now,
          criteriaResults: criteriaResultsForThisInterview,
          // Opcional:
          // criteriaScores: criteriaScoresForThisInterview,
        });
      }
    }

    return NextResponse.json(allInterviewEvaluations, { status: 200 });
  } catch (error) {
    console.error('Error fetching interview performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview performance metrics' },
      { status: 500 }
    );
  }
}