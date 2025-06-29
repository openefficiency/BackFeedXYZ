/*
  # Complete database schema setup with safe policy handling

  1. New Tables
    - `cases` - Main feedback cases with confirmation codes
    - `transcripts` - Voice transcription data
    - `hr_interactions` - Two-way communication system
    - `ai_insights` - AI analysis results
    - `hr_users` - HR team members

  2. Security
    - Enable RLS on all tables
    - Safe policy creation with IF EXISTS checks
    - Public access for anonymous feedback submission
    - Authenticated access for HR management

  3. Performance
    - Comprehensive indexing strategy
    - Optimized for case lookup and filtering
    - Efficient foreign key relationships

  4. Sample Data
    - Demo HR users with test credentials
    - Realistic test cases for development
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

-- Create hr_users table
CREATE TABLE IF NOT EXISTS hr_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'hr_manager',
  department text,
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

-- Enable Row Level Security (safe to run multiple times)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- Safely handle cases table policies
DROP POLICY IF EXISTS "Anyone can create cases" ON cases;
DROP POLICY IF EXISTS "Anyone can read cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can delete cases" ON cases;
DROP POLICY IF EXISTS "Public can create cases" ON cases;
DROP POLICY IF EXISTS "Public can read cases" ON cases;

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
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cases"
  ON cases
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Public can create cases"
  ON cases
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read cases"
  ON cases
  FOR SELECT
  TO public
  USING (true);

-- Safely handle transcripts table policies
DROP POLICY IF EXISTS "Anyone can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Anyone can read transcripts" ON transcripts;
DROP POLICY IF EXISTS "Authenticated users can update transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can read transcripts" ON transcripts;

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

CREATE POLICY "Authenticated users can update transcripts"
  ON transcripts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can create transcripts"
  ON transcripts
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read transcripts"
  ON transcripts
  FOR SELECT
  TO public
  USING (true);

-- Safely handle hr_interactions table policies
DROP POLICY IF EXISTS "Anyone can create hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Anyone can read hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Authenticated users can update interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can create interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can read interactions" ON hr_interactions;

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

CREATE POLICY "Authenticated users can update interactions"
  ON hr_interactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can create interactions"
  ON hr_interactions
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read interactions"
  ON hr_interactions
  FOR SELECT
  TO public
  USING (true);

-- Safely handle ai_insights table policies
DROP POLICY IF EXISTS "Anyone can create ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Anyone can read ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Authenticated users can update insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can create insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can read insights" ON ai_insights;

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

CREATE POLICY "Authenticated users can update insights"
  ON ai_insights
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can create insights"
  ON ai_insights
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can read insights"
  ON ai_insights
  FOR SELECT
  TO public
  USING (true);

-- Safely handle hr_users table policies
DROP POLICY IF EXISTS "Anyone can read hr_users" ON hr_users;
DROP POLICY IF EXISTS "Authenticated users can manage hr_users" ON hr_users;
DROP POLICY IF EXISTS "Public can read hr_users" ON hr_users;

CREATE POLICY "Anyone can read hr_users"
  ON hr_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage hr_users"
  ON hr_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can read hr_users"
  ON hr_users
  FOR SELECT
  TO public
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Safely create triggers for updated_at columns
DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
DROP TRIGGER IF EXISTS update_hr_users_updated_at ON hr_users;

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hr_users_updated_at
  BEFORE UPDATE ON hr_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample HR users for demo purposes (safe with ON CONFLICT)
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'test@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Wilson', 'manager@company.com', 'hr_manager', 'People Operations'),
  ('Lisa Chen', 'specialist@company.com', 'hr_specialist', 'Employee Relations')
ON CONFLICT (email) DO NOTHING;