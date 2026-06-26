/*
# CareerPilot AI Database Schema

## 1. New Tables

### resumes
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `filename` (text) - Original uploaded filename
- `content` (text) - Extracted text content from PDF
- `file_url` (text) - Storage URL for the PDF file
- `is_primary` (boolean) - Whether this is the user's primary resume
- `created_at` (timestamptz) - Upload timestamp
- `updated_at` (timestamptz) - Last modification timestamp

### job_analyses
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `resume_id` (uuid, foreign key to resumes)
- `job_description` (text) - The job description text
- `job_title` (text) - Extracted job title
- `company_name` (text) - Extracted company name
- `ats_score` (integer) - ATS compatibility score (0-100)
- `match_score` (integer) - Job match score (0-100)
- `analysis_result` (jsonb) - Full analysis including strengths, gaps, recommendations
- `tailored_resume` (text) - AI-generated tailored resume
- `created_at` (timestamptz) - Analysis timestamp

### cover_letters
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `resume_id` (uuid, foreign key to resumes)
- `job_description` (text) - Target job description
- `job_title` (text) - Job title
- `company_name` (text) - Company name
- `content` (text) - Generated cover letter content
- `created_at` (timestamptz) - Creation timestamp

### job_search_plans
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `analysis_id` (uuid, foreign key to job_analyses)
- `plan_content` (jsonb) - Structured job search plan
- `created_at` (timestamptz) - Creation timestamp

### user_credits
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users, unique)
- `credits` (integer) - Available analysis credits
- `plan` (text) - Subscription plan (free, pro, enterprise)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## 2. Security
Row Level Security enabled on all tables with owner-scoped policies.
*/

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  content text,
  file_url text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_resumes" ON resumes;
CREATE POLICY "select_own_resumes" ON resumes FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_resumes" ON resumes;
CREATE POLICY "insert_own_resumes" ON resumes FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_resumes" ON resumes;
CREATE POLICY "update_own_resumes" ON resumes FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_resumes" ON resumes;
CREATE POLICY "delete_own_resumes" ON resumes FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Job analyses table
CREATE TABLE IF NOT EXISTS job_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  job_description text NOT NULL,
  job_title text,
  company_name text,
  ats_score integer,
  match_score integer,
  analysis_result jsonb,
  tailored_resume text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_analyses" ON job_analyses;
CREATE POLICY "select_own_analyses" ON job_analyses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON job_analyses;
CREATE POLICY "insert_own_analyses" ON job_analyses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON job_analyses;
CREATE POLICY "update_own_analyses" ON job_analyses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON job_analyses;
CREATE POLICY "delete_own_analyses" ON job_analyses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Cover letters table
CREATE TABLE IF NOT EXISTS cover_letters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_id uuid REFERENCES resumes(id) ON DELETE CASCADE,
  job_description text NOT NULL,
  job_title text,
  company_name text,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cover_letters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cover_letters" ON cover_letters;
CREATE POLICY "select_own_cover_letters" ON cover_letters FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cover_letters" ON cover_letters;
CREATE POLICY "insert_own_cover_letters" ON cover_letters FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cover_letters" ON cover_letters;
CREATE POLICY "update_own_cover_letters" ON cover_letters FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cover_letters" ON cover_letters;
CREATE POLICY "delete_own_cover_letters" ON cover_letters FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Job search plans table
CREATE TABLE IF NOT EXISTS job_search_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES job_analyses(id) ON DELETE CASCADE,
  plan_content jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE job_search_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_plans" ON job_search_plans;
CREATE POLICY "select_own_plans" ON job_search_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_plans" ON job_search_plans;
CREATE POLICY "insert_own_plans" ON job_search_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_plans" ON job_search_plans;
CREATE POLICY "update_own_plans" ON job_search_plans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_plans" ON job_search_plans;
CREATE POLICY "delete_own_plans" ON job_search_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- User credits table
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits integer DEFAULT 3,
  plan text DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_credits" ON user_credits;
CREATE POLICY "select_own_credits" ON user_credits FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_credits" ON user_credits;
CREATE POLICY "insert_own_credits" ON user_credits FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_credits" ON user_credits;
CREATE POLICY "update_own_credits" ON user_credits FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON job_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_user_id ON job_search_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON user_credits(user_id);

-- Function to auto-create user_credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_credits (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Storage bucket for resumes
INSERT INTO storage.buckets (id, name, public) VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "select_own_resumes_storage" ON storage.objects;
CREATE POLICY "select_own_resumes_storage" ON storage.objects FOR SELECT
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "insert_own_resumes_storage" ON storage.objects;
CREATE POLICY "insert_own_resumes_storage" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "update_own_resumes_storage" ON storage.objects;
CREATE POLICY "update_own_resumes_storage" ON storage.objects FOR UPDATE
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "delete_own_resumes_storage" ON storage.objects;
CREATE POLICY "delete_own_resumes_storage" ON storage.objects FOR DELETE
  TO authenticated USING (bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]);