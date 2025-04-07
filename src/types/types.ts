// User types
export interface User {
  id: string;
  name: string;
}

// Institution types
export interface Institution {
  id: bigint;
  name: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: Date;
}

// Career types
export interface Career {
  id: bigint;
  name: string;
}

// Area types
export interface Area {
  id: bigint;
  name: string;
}

// Interview types
export interface Interview {
  id: bigint;
  user_id: string;
  job_description: string;
  resume: string;
}

// Conversation types
export interface Conversation {
  id: bigint;
  interview_id: bigint;
  //details: JSON
}

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  birthday: Date;
  institution_id?: bigint; // Opcional
  career_id?: bigint; // Opcional
}