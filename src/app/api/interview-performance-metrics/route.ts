import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Define la estructura para los datos de salida
interface InterviewPerformanceMetric {
  interview_id: string;
  user_id: string;
  institution_id: number;
  career_id: number;
  area_id: number;
  criteria_name: string;
  criterionScore: number;
  gender: string;
  age: number;
  extracted_at: Date;
}

const PREDEFINED_CRITERIA_NORMALIZED: Record<string, string> = {
  claridad: 'Claridad',
  profesionalismo: 'Profesionalismo',
  tecnica: 'Técnica',
  interes: 'Interés',
  ejemplos: 'Ejemplos'
};

const USER_CRITERIA_KEYS = Object.keys(PREDEFINED_CRITERIA_NORMALIZED);

// Define un tipo para las claves de las propiedades de puntuación en InterviewResult
// Estas son las propiedades que esperas que existan en el objeto 'result'
type ScorePropertyKeys = 'claridadNota' | 'profesionalismoNota' | 'tecnicaNota' | 'interesNota' | 'ejemplosNota';

// Mapeo entre las claves de los criterios y las propiedades de 'interviewResult'
// Asegura que los valores del mapeo sean del tipo ScorePropertyKeys
const CRITERIA_SCORE_MAP: Record<string, ScorePropertyKeys> = {
    claridad: 'claridadNota',
    profesionalismo: 'profesionalismoNota',
    tecnica: 'tecnicaNota',
    interes: 'interesNota',
    ejemplos: 'ejemplosNota'
};

export async function GET() {
  try {
    // Prisma infiere automáticamente el tipo de 'interviewResults'
    // basándose en el modelo 'interviewResult' y las relaciones 'include'.
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

    const performanceMetrics: InterviewPerformanceMetric[] = [];
    const now = new Date();

    for (const result of interviewResults) {
      // Verificar que todos los datos necesarios para las métricas base estén presentes.
      if (!result.interview?.user?.career?.area || !result.interview?.user?.institution) {
        console.warn(`Skipping interviewResult ${result.id} due to missing associated user, career, area, or institution data.`);
        continue;
      }

      const user = result.interview.user;

      // Calcular la edad, asumiendo que user.birthday siempre es una fecha válida.
      const birthDate = user.birthday;
      const ageInMilliseconds = now.getTime() - new Date(birthDate).getTime();
      const ageInYears = Math.floor(ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25));

      for (const criterionKey of USER_CRITERIA_KEYS) {
        const criterionDisplayName = PREDEFINED_CRITERIA_NORMALIZED[criterionKey];

        const scoreKey = CRITERIA_SCORE_MAP[criterionKey];
        // TypeScript ahora sabe que 'scoreKey' es una de las claves válidas
        // ('claridadNota', etc.) en 'result'. El tipo inferido para 'criterionScore'
        // será `number | null` porque las columnas Int? de Prisma se mapean a `number | null`.
        const criterionScore = result[scoreKey];

        // Cambiar la comprobación de 'undefined' a 'null'
        if (criterionScore !== null) {
          performanceMetrics.push({
            interview_id: result.interview_id,
            user_id: user.id,
            institution_id: Number(user.institution_id),
            career_id: Number(user.career_id),
            area_id: Number(user.career.area.id),
            criteria_name: criterionDisplayName,
            criterionScore: criterionScore,
            gender: user.gender,
            age: ageInYears,
            extracted_at: now,
          });
        }
      }
    }

    return NextResponse.json(performanceMetrics, { status: 200 });
  } catch (error) {
    console.error('Error fetching interview performance metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interview performance metrics' },
      { status: 500 }
    );
  }
}