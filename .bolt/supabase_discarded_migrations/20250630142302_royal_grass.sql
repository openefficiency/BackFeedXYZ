/*
  # Fix Duplicate Policies Migration

  This migration safely handles existing policies by dropping and recreating them
  to ensure a clean state without conflicts.

  ## Changes
  1. Drop existing policies if they exist
  2. Recreate all necessary policies with proper permissions
  3. Ensure RLS is enabled on all tables

  ## Security
  - Maintains proper Row Level Security
  - Preserves existing access patterns
  - Ensures anonymous feedback submission works
*/

-- Drop existing policies if they exist (using IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can delete cases" ON cases;
DROP POLICY IF EXISTS "Public can create cases" ON cases;
DROP POLICY IF EXISTS "Public can read cases" ON cases;

DROP POLICY IF EXISTS "Authenticated users can update interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can create interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can read interactions" ON hr_interactions;

DROP POLICY IF EXISTS "Authenticated users can update insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can create insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can read insights" ON ai_insights;

DROP POLICY IF EXISTS "Authenticated users can update transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can read transcripts" ON transcripts;

DROP POLICY IF EXISTS "Authenticated users can manage hr_users" ON hr_users;
DROP POLICY IF EXISTS "Public can read hr_users" ON hr_users;

DROP POLICY IF EXISTS "HR users can view webhook logs for their cases" ON webhook_logs;
DROP POLICY IF EXISTS "Public can create webhook logs" ON webhook_logs;
DROP POLICY IF EXISTS "Service role can manage all webhook logs" ON webhook_logs;

-- Ensure RLS is enabled on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Recreate policies for cases table
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

-- Recreate policies for hr_interactions table
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

-- Recreate policies for ai_insights table
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

-- Recreate policies for transcripts table
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

-- Recreate policies for hr_users table
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

-- Recreate policies for webhook_logs table
CREATE POLICY "Public can create webhook logs"
  ON webhook_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "HR users can view webhook logs for their cases"
  ON webhook_logs
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM cases
      WHERE cases.id = webhook_logs.case_id
    )
  );

CREATE POLICY "Service role can manage all webhook logs"
  ON webhook_logs
  FOR ALL
  TO public
  USING (role() = 'service_role'::text);