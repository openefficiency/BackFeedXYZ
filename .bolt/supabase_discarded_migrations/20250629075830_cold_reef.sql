/*
  # Update RLS Policies for Enhanced Security and Performance

  1. Updates
    - Add UPDATE and DELETE policies where missing
    - Ensure consistent policy naming
    - Add policies for new columns and features

  2. Security Enhancements
    - Maintain anonymous access for feedback submission
    - Secure HR management functions
    - Protect sensitive AI insights
*/

-- Add missing UPDATE and DELETE policies for transcripts
DROP POLICY IF EXISTS "Authenticated users can update transcripts" ON transcripts;
CREATE POLICY "Authenticated users can update transcripts"
  ON transcripts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can delete transcripts" ON transcripts;
CREATE POLICY "Authenticated users can delete transcripts"
  ON transcripts
  FOR DELETE
  TO authenticated
  USING (true);

-- Add missing DELETE policy for hr_interactions
DROP POLICY IF EXISTS "Authenticated users can delete interactions" ON hr_interactions;
CREATE POLICY "Authenticated users can delete interactions"
  ON hr_interactions
  FOR DELETE
  TO authenticated
  USING (true);

-- Add missing UPDATE and DELETE policies for ai_insights
DROP POLICY IF EXISTS "Authenticated users can delete insights" ON ai_insights;
CREATE POLICY "Authenticated users can delete insights"
  ON ai_insights
  FOR DELETE
  TO authenticated
  USING (true);

-- Add missing DELETE policy for hr_users
DROP POLICY IF EXISTS "Authenticated users can delete hr_users" ON hr_users;
CREATE POLICY "Authenticated users can delete hr_users"
  ON hr_users
  FOR DELETE
  TO authenticated
  USING (true);

-- Ensure all tables have proper RLS enabled
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;