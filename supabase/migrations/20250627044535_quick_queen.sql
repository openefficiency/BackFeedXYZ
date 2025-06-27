/*
  # Complete Voice AI Agent System Database Schema

  1. New Tables
    - `cases` - Main case tracking table with confirmation codes, categories, and status
    - `transcripts` - Audio transcription storage with sentiment analysis
    - `hr_interactions` - Communication log between employees and HR
    - `ai_insights` - AI-generated insights and analysis results
    - `hr_users` - HR manager authentication and profile data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
    - Secure HR user authentication

  3. Features
    - UUID primary keys with automatic generation
    - Timestamp tracking for all records
    - Proper foreign key relationships
    - Indexed columns for performance
    - Default values for consistent data
*/

-- Create cases table
CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'General Feedback',
  summary text NOT NULL,
  severity integer NOT NULL DEFAULT 3 CHECK (severity >= 1 AND severity <= 5),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transcripts table
CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  raw_transcript text NOT NULL,
  processed_summary text,
  sentiment_score decimal(3,2) DEFAULT 0.0 CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0),
  created_at timestamptz DEFAULT now()
);

-- Create hr_interactions table
CREATE TABLE IF NOT EXISTS hr_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('employee', 'hr_manager', 'system')),
  sender_name text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

-- Create ai_insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  insight_type text NOT NULL,
  content jsonb NOT NULL,
  confidence_score decimal(3,2) DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  created_at timestamptz DEFAULT now()
);

-- Create hr_users table with department column
CREATE TABLE IF NOT EXISTS hr_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'hr_manager',
  department text DEFAULT 'Human Resources',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_confirmation_code ON cases(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at);
CREATE INDEX IF NOT EXISTS idx_transcripts_case_id ON transcripts(case_id);
CREATE INDEX IF NOT EXISTS idx_hr_interactions_case_id ON hr_interactions(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_case_id ON ai_insights(case_id);
CREATE INDEX IF NOT EXISTS idx_hr_users_email ON hr_users(email);

-- Enable Row Level Security
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cases table
CREATE POLICY "Anyone can create cases"
  ON cases
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read cases"
  ON cases
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update cases"
  ON cases
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create RLS policies for transcripts table
CREATE POLICY "Anyone can create transcripts"
  ON transcripts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read transcripts"
  ON transcripts
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create RLS policies for hr_interactions table
CREATE POLICY "Anyone can create hr_interactions"
  ON hr_interactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read hr_interactions"
  ON hr_interactions
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create RLS policies for ai_insights table
CREATE POLICY "Anyone can create ai_insights"
  ON ai_insights
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read ai_insights"
  ON ai_insights
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create RLS policies for hr_users table
CREATE POLICY "Anyone can read hr_users"
  ON hr_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage hr_users"
  ON hr_users
  FOR ALL
  TO authenticated
  USING (true);

-- Insert sample HR users for demo purposes
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'sarah.johnson@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'michael.chen@company.com', 'hr_director', 'Human Resources'),
  ('Emily Rodriguez', 'emily.rodriguez@company.com', 'hr_specialist', 'Employee Relations')
ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cases_updated_at') THEN
    CREATE TRIGGER update_cases_updated_at
      BEFORE UPDATE ON cases
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_hr_users_updated_at') THEN
    CREATE TRIGGER update_hr_users_updated_at
      BEFORE UPDATE ON hr_users
      FOR EACH ROW
      EXECUTE FUNCTION update_hr_users_updated_at_column();
  END IF;
END $$;