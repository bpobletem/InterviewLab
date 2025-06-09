export interface SignUpData {
  email: string;
  password: string;
  name: string;
  birthday: Date;
  gender: string;
  institution_id: bigint;
  career_id: bigint;
}

export interface EvaluationCriterion {
  criterion: string;
  feedback: string;
  result?: 'success' | 'failure' | 'unknown';
}

export interface CriterionResult {
  result: 'success' | 'failure' | 'unknown';
  rationale: string;
}

// Interface for conversation details returned by the API
export interface ConversationDetails {
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

// Interface for paginated API responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

// Interface for interview data
export interface Interview {
  id: string;
  title: string;
  created_at: string;
  job_description: string;
  resume: string;
  user_id: string;
}

export interface GeminiCriterion {
  nota: number;
  razon: string;
}

export interface GeminiFeedbackResponse {
  criterios: {
    tecnica: GeminiCriterion;
    interes: GeminiCriterion;
    claridad: GeminiCriterion;
    ejemplos: GeminiCriterion;
    profesionalismo: GeminiCriterion;
  };
  resultado: {
    nota: number;
    razon: string;
  };
}

export interface InterviewResultFromAPI {
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

export interface ProcessedEvaluationCriterion {
  criterion: string;
  score: number;
  feedback: string;
  isApproved: boolean;
  isEvaluated: boolean;
}

export type PartialFeedbackResponse = {
  criterios?: {
    claridad?: { nota?: number; razon?: string };
    profesionalismo?: { nota?: number; razon?: string };
    tecnica?: { nota?: number; razon?: string };
    interes?: { nota?: number; razon?: string };
    ejemplos?: { nota?: number; razon?: string };
  };
  resultado?: { nota?: number; razon?: string };
};