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

