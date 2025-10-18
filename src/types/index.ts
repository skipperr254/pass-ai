export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string | null;
          avatar_url: string | null;
          storage_used: number;
          storage_limit: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          storage_used?: number;
          storage_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          storage_used?: number;
          storage_limit?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          test_date: string | null;
          progress: number;
          pass_chance: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          test_date?: string | null;
          progress?: number;
          pass_chance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          test_date?: string | null;
          progress?: number;
          pass_chance?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      materials: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          extracted_text: string | null;
          analysis: Json | null;
          is_analyzed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          file_name: string;
          file_type: string;
          file_size: number;
          file_url: string;
          extracted_text?: string | null;
          analysis?: Json | null;
          is_analyzed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          file_url?: string;
          extracted_text?: string | null;
          analysis?: Json | null;
          is_analyzed?: boolean;
          created_at?: string;
        };
      };
      quizzes: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          material_ids: string[];
          title: string;
          difficulty: string;
          questions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          material_ids: string[];
          title: string;
          difficulty: string;
          questions: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          material_ids?: string[];
          title?: string;
          difficulty?: string;
          questions?: Json;
          created_at?: string;
        };
      };
      quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          quiz_id: string;
          subject_id: string;
          score: number;
          total_questions: number;
          answers: Json;
          time_taken: number;
          completed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          quiz_id: string;
          subject_id: string;
          score: number;
          total_questions: number;
          answers: Json;
          time_taken: number;
          completed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          quiz_id?: string;
          subject_id?: string;
          score?: number;
          total_questions?: number;
          answers?: Json;
          time_taken?: number;
          completed_at?: string;
        };
      };
      study_plans: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          test_date: string;
          daily_tasks: Json;
          total_study_time: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          test_date: string;
          daily_tasks: Json;
          total_study_time: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          test_date?: string;
          daily_tasks?: Json;
          total_study_time?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          materials_uploaded: number;
          quizzes_taken: number;
          average_score: number;
          study_time: number;
          last_activity: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          materials_uploaded?: number;
          quizzes_taken?: number;
          average_score?: number;
          study_time?: number;
          last_activity?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          materials_uploaded?: number;
          quizzes_taken?: number;
          average_score?: number;
          study_time?: number;
          last_activity?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name?: string;
  avatar_url?: string;
  storage_used: number;
  storage_limit: number;
  created_at: string;
  updated_at: string;
}

// Subject Types
export interface Subject {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  test_date?: string;
  progress: number;
  pass_chance?: number;
  created_at: string;
  updated_at: string;
}

// Material Types
export interface Material {
  id: string;
  user_id: string;
  subject_id: string;
  file_name: string;
  file_type: "pdf" | "docx" | "pptx" | "image" | "text";
  file_size: number;
  file_url: string;
  extracted_text?: string;
  analysis?: MaterialAnalysis;
  is_analyzed: boolean;
  created_at: string;
}

export interface MaterialAnalysis {
  key_concepts: string[];
  main_ideas: string;
  important_points: string[];
  difficulty_level: "beginner" | "intermediate" | "advanced";
  estimated_study_time: number; // in minutes
}

// Quiz Types
export interface Quiz {
  id: string;
  user_id: string;
  subject_id: string;
  material_ids: string[];
  title: string;
  difficulty: "easy" | "medium" | "hard";
  questions: QuizQuestion[];
  created_at: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  type: "multiple_choice" | "true_false";
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  subject_id: string;
  score: number;
  total_questions: number;
  answers: QuizAnswer[];
  time_taken: number; // in seconds
  completed_at: string;
}

export interface QuizAnswer {
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
}

// Study Plan Types
export interface StudyPlan {
  id: string;
  user_id: string;
  subject_id: string;
  test_date: string;
  daily_tasks: DailyTask[];
  total_study_time: number; // in minutes
  created_at: string;
  updated_at: string;
}

export interface DailyTask {
  date: string;
  tasks: string[];
  duration: number; // in minutes
  completed: boolean;
}

// Progress Tracking Types
export interface Progress {
  id: string;
  user_id: string;
  subject_id: string;
  materials_uploaded: number;
  quizzes_taken: number;
  average_score: number;
  study_time: number; // in minutes
  last_activity: string;
  updated_at: string;
}

// File Upload Types
export interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "processing" | "completed" | "error";
  error?: string;
}

// Analytics Types
export interface SubjectAnalytics {
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  worstScore: number;
  trend: "improving" | "declining" | "stable";
  recentPerformance: number[];
  attempts: QuizAttemptWithDetails[];
  difficultyStats: {
    easy: QuizAttemptWithDetails[];
    medium: QuizAttemptWithDetails[];
    hard: QuizAttemptWithDetails[];
  };
}

export interface QuizAttemptWithDetails extends QuizAttempt {
  quizzes?: {
    title: string;
    difficulty: string;
  };
  subjects: {
    name: string;
  };
}

export interface QuizHistoryItem {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string;
  time_taken: number;
  quizzes: {
    title: string;
    difficulty: string;
  };
  subjects: {
    name: string;
  };
}

export interface ChartDataPoint {
  date: string;
  score: number;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
