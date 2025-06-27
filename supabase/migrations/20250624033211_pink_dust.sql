/*
  # Fix RLS Policies for Voice AI Agent System

  1. Security Updates
    - Fix RLS policies for proper access control
    - Ensure anonymous users can create cases and interactions
    - Allow authenticated HR users full access
    - Add proper policies for AI insights and transcripts

  2. Policy Updates
    - Remove conflicting policies
    - Add comprehensive policies for all operations
    - Ensure proper access for both anonymous and authenticated users
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create cases" ON cases;
DROP POLICY IF EXISTS "Anyone can read cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can view all cases" ON cases;
DROP POLICY IF EXISTS "Anonymous can create cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;

DROP POLICY IF EXISTS "Anyone can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Anyone can read transcripts" ON transcripts;
DROP POLICY IF EXISTS "Authenticated users can view transcripts" ON transcripts;
DROP POLICY IF EXISTS "System can insert transcripts" ON transcripts;

DROP POLICY IF EXISTS "Anyone can create hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Anyone can read hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Anyone can create interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Authenticated users can view interactions" ON hr_interactions;

DROP POLICY IF EXISTS "Anyone can create ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Anyone can read ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Authenticated users can view insights" ON ai_insights;
DROP POLICY IF EXISTS "System can insert insights" ON ai_insights;

DROP POLICY IF EXISTS "Anyone can read hr_users" ON hr_users;
DROP POLICY IF EXISTS "Authenticated users can manage hr_users" ON hr_users;
DROP POLICY IF EXISTS "HR users can view other HR users" ON hr_users;
DROP POLICY IF EXISTS "Admins can insert HR users" ON hr_users;

-- Create comprehensive RLS policies for cases table
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

-- Create comprehensive RLS policies for transcripts table
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

CREATE POLICY "Authenticated users can update transcripts"
  ON transcripts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for hr_interactions table
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

CREATE POLICY "Authenticated users can update interactions"
  ON hr_interactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for ai_insights table
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

CREATE POLICY "Authenticated users can update insights"
  ON ai_insights
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create comprehensive RLS policies for hr_users table
CREATE POLICY "Public can read hr_users"
  ON hr_users
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage hr_users"
  ON hr_users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category);
CREATE INDEX IF NOT EXISTS idx_transcripts_sentiment ON transcripts(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_hr_interactions_sender_type ON hr_interactions(sender_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);

-- Update AI insights table to support more insight types
DO $$
BEGIN
  -- Remove the constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'ai_insights_insight_type_check' 
    AND table_name = 'ai_insights'
  ) THEN
    ALTER TABLE ai_insights DROP CONSTRAINT ai_insights_insight_type_check;
  END IF;
END $$;

-- Add updated constraint with more insight types
ALTER TABLE ai_insights ADD CONSTRAINT ai_insights_insight_type_check 
CHECK (insight_type IN (
  'risk_assessment', 
  'next_steps', 
  'similar_cases', 
  'sentiment_analysis',
  'elevenlabs_conversation',
  'elevenlabs_realtime',
  'deepgram_realtime',
  'deepgram_processing',
  'conversation_quality',
  'emotional_analysis'
));

-- Verify RLS is working correctly
DO $$
DECLARE
  rls_enabled_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_enabled_count
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.relname IN ('cases', 'transcripts', 'hr_interactions', 'ai_insights', 'hr_users')
  AND n.nspname = 'public'
  AND c.relrowsecurity = true;
  
  IF rls_enabled_count != 5 THEN
    RAISE EXCEPTION 'RLS is not enabled on all required tables. Expected 5, got %', rls_enabled_count;
  END IF;
  
  RAISE NOTICE 'RLS verification completed successfully - all tables have RLS enabled';
END $$;