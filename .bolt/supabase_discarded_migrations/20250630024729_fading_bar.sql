/*
  # Complete Voice AI Agent System Database Schema - Fixed Migration

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

-- Create hr_users table WITH department column from the start
CREATE TABLE IF NOT EXISTS hr_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'hr_manager' CHECK (role IN ('hr_manager', 'hr_admin', 'hr_specialist', 'hr_director', 'hr_coordinator')),
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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Anyone can create cases'
  ) THEN
    CREATE POLICY "Anyone can create cases"
      ON cases
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Anyone can read cases'
  ) THEN
    CREATE POLICY "Anyone can read cases"
      ON cases
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cases' AND policyname = 'Authenticated users can update cases'
  ) THEN
    CREATE POLICY "Authenticated users can update cases"
      ON cases
      FOR UPDATE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create RLS policies for transcripts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transcripts' AND policyname = 'Anyone can create transcripts'
  ) THEN
    CREATE POLICY "Anyone can create transcripts"
      ON transcripts
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transcripts' AND policyname = 'Anyone can read transcripts'
  ) THEN
    CREATE POLICY "Anyone can read transcripts"
      ON transcripts
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Create RLS policies for hr_interactions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_interactions' AND policyname = 'Anyone can create hr_interactions'
  ) THEN
    CREATE POLICY "Anyone can create hr_interactions"
      ON hr_interactions
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_interactions' AND policyname = 'Anyone can read hr_interactions'
  ) THEN
    CREATE POLICY "Anyone can read hr_interactions"
      ON hr_interactions
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Create RLS policies for ai_insights table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_insights' AND policyname = 'Anyone can create ai_insights'
  ) THEN
    CREATE POLICY "Anyone can create ai_insights"
      ON ai_insights
      FOR INSERT
      TO anon, authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'ai_insights' AND policyname = 'Anyone can read ai_insights'
  ) THEN
    CREATE POLICY "Anyone can read ai_insights"
      ON ai_insights
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- Create RLS policies for hr_users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_users' AND policyname = 'Anyone can read hr_users'
  ) THEN
    CREATE POLICY "Anyone can read hr_users"
      ON hr_users
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'hr_users' AND policyname = 'Authenticated users can manage hr_users'
  ) THEN
    CREATE POLICY "Authenticated users can manage hr_users"
      ON hr_users
      FOR ALL
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert sample HR users for demo purposes
INSERT INTO hr_users (name, email, role, department) VALUES
  ('Sarah Johnson', 'hr@company.com', 'hr_manager', 'Human Resources'),
  ('Michael Chen', 'admin@company.com', 'hr_admin', 'Human Resources'),
  ('Emily Rodriguez', 'test@company.com', 'hr_specialist', 'Employee Relations'),
  ('David Kim', 'david.kim@company.com', 'hr_director', 'Human Resources'),
  ('Lisa Wang', 'lisa.wang@company.com', 'hr_coordinator', 'Human Resources')
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
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Insert comprehensive test cases with various scenarios
INSERT INTO cases (confirmation_code, category, summary, severity, status, created_at, updated_at) VALUES
  -- High priority safety case
  ('AB7X9K2M4P', 'Workplace Safety', 'Employee reported serious safety concerns about unmaintained equipment and undocumented near-miss incidents. Multiple safety protocol violations observed in manufacturing area. Immediate attention required to prevent potential accidents.', 4, 'investigating', '2025-01-17T10:30:00Z', '2025-01-18T14:15:00Z'),
  
  -- Harassment case
  ('CD8Y5N3Q1R', 'Harassment', 'Report of inappropriate behavior and discriminatory comments from supervisor creating hostile work environment. Multiple witnesses available. Employee experiencing stress and considering resignation due to ongoing harassment.', 4, 'open', '2025-01-17T09:15:00Z', '2025-01-17T09:15:00Z'),
  
  -- Policy violation - resolved
  ('EF9Z6P4S2T', 'Policy Violation', 'Concerns about inconsistent break time policy enforcement causing unfair work distribution. Some employees taking extended breaks while others cover responsibilities. Management oversight needed.', 2, 'closed', '2025-01-16T15:45:00Z', '2025-01-17T08:30:00Z'),
  
  -- Critical discrimination case
  ('GH1A7R5U3V', 'Discrimination', 'Report of systematic discriminatory hiring practices based on age and gender. Pattern observed in recent hiring decisions and promotion opportunities. Legal compliance review required immediately.', 5, 'investigating', '2025-01-16T11:20:00Z', '2025-01-18T13:45:00Z')
ON CONFLICT (confirmation_code) DO NOTHING;

-- Insert realistic transcripts for each case
INSERT INTO transcripts (case_id, raw_transcript, processed_summary, sentiment_score) 
SELECT 
  c.id,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'I need to report serious safety concerns in our manufacturing department. The equipment hasnt been properly maintained for months and there have been several near-miss incidents that management isnt documenting properly.'
    WHEN 'CD8Y5N3Q1R' THEN 'I need to report my supervisor for inappropriate behavior and harassment. He has been making inappropriate comments about my appearance and other female employees.'
    WHEN 'EF9Z6P4S2T' THEN 'I want to bring up concerns about break time policies not being enforced fairly. Some employees regularly take 30-45 minute breaks when theyre supposed to be 15 minutes.'
    WHEN 'GH1A7R5U3V' THEN 'I believe there are serious discriminatory hiring practices happening in our department. Over the past year, Ive observed a clear pattern where qualified female and older candidates are being passed over.'
  END,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN 'Safety concerns regarding unmaintained equipment and undocumented incidents in manufacturing.'
    WHEN 'CD8Y5N3Q1R' THEN 'Supervisor harassment including inappropriate comments creating hostile work environment.'
    WHEN 'EF9Z6P4S2T' THEN 'Inconsistent break policy enforcement causing unfair work distribution.'
    WHEN 'GH1A7R5U3V' THEN 'Systematic discriminatory hiring practices based on gender and age.'
  END,
  CASE c.confirmation_code
    WHEN 'AB7X9K2M4P' THEN -0.4
    WHEN 'CD8Y5N3Q1R' THEN -0.7
    WHEN 'EF9Z6P4S2T' THEN -0.3
    WHEN 'GH1A7R5U3V' THEN -0.8
  END
FROM cases c
WHERE c.confirmation_code IN ('AB7X9K2M4P', 'CD8Y5N3Q1R', 'EF9Z6P4S2T', 'GH1A7R5U3V');

-- Insert initial system messages for all cases
INSERT INTO hr_interactions (case_id, message, sender_type, sender_name, created_at)
SELECT 
  c.id,
  'Thank you for your report. We have received your feedback and have assigned it to our team for investigation. Your case has been assigned confirmation code ' || c.confirmation_code || ' for tracking purposes.',
  'system',
  'HR System',
  c.created_at + INTERVAL '5 minutes'
FROM cases c
WHERE c.confirmation_code IN ('AB7X9K2M4P', 'CD8Y5N3Q1R', 'EF9Z6P4S2T', 'GH1A7R5U3V');

-- Insert AI insights for risk assessment
INSERT INTO ai_insights (case_id, insight_type, content, confidence_score)
SELECT 
  c.id,
  'risk_assessment',
  jsonb_build_object(
    'risk_level', c.severity,
    'risk_factors', CASE 
      WHEN c.category = 'Workplace Safety' THEN ARRAY['Physical harm potential', 'Regulatory compliance', 'Equipment failure']
      WHEN c.category = 'Harassment' THEN ARRAY['Legal liability', 'Employee retention', 'Workplace culture']
      WHEN c.category = 'Discrimination' THEN ARRAY['Legal compliance', 'EEOC violations', 'Reputation risk']
      WHEN c.category = 'Policy Violation' THEN ARRAY['Operational efficiency', 'Employee fairness']
      ELSE ARRAY['General workplace concern']
    END,
    'immediate_action_required', c.severity >= 4,
    'estimated_impact', CASE 
      WHEN c.severity >= 4 THEN 'High'
      WHEN c.severity >= 3 THEN 'Medium'
      ELSE 'Low'
    END
  ),
  0.85
FROM cases c
WHERE c.confirmation_code IN ('AB7X9K2M4P', 'CD8Y5N3Q1R', 'EF9Z6P4S2T', 'GH1A7R5U3V');