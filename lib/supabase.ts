import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      resumes: {
        Row: {
          id: string;
          user_id: string;
          filename: string;
          content: string | null;
          file_url: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          filename: string;
          content?: string | null;
          file_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          filename?: string;
          content?: string | null;
          file_url?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_analyses: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_description: string;
          job_title: string | null;
          company_name: string | null;
          ats_score: number | null;
          match_score: number | null;
          analysis_result: Record<string, unknown> | null;
          tailored_resume: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_description: string;
          job_title?: string | null;
          company_name?: string | null;
          ats_score?: number | null;
          match_score?: number | null;
          analysis_result?: Record<string, unknown> | null;
          tailored_resume?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_description?: string;
          job_title?: string | null;
          company_name?: string | null;
          ats_score?: number | null;
          match_score?: number | null;
          analysis_result?: Record<string, unknown> | null;
          tailored_resume?: string | null;
          created_at?: string;
        };
      };
      cover_letters: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          job_description: string;
          job_title: string | null;
          company_name: string | null;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_description: string;
          job_title?: string | null;
          company_name?: string | null;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          resume_id?: string | null;
          job_description?: string;
          job_title?: string | null;
          company_name?: string | null;
          content?: string;
          created_at?: string;
        };
      };
      job_search_plans: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          plan_content: Record<string, unknown> | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          analysis_id?: string | null;
          plan_content?: Record<string, unknown> | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          analysis_id?: string | null;
          plan_content?: Record<string, unknown> | null;
          created_at?: string;
        };
      };
      user_credits: {
        Row: {
          id: string;
          user_id: string;
          credits: number;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          credits?: number;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credits?: number;
          plan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
