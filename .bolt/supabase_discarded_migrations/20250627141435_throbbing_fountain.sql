/*
  # Fix Policy Conflicts Migration

  This migration safely removes all existing policies and recreates them properly.
  It handles the case where policies already exist and need to be recreated.

  ## Changes Made
  1. Drop all existing policies safely
  2. Recreate all necessary policies with proper permissions
  3. Ensure RLS is enabled on all tables
*/

-- First, let's disable RLS temporarily to avoid conflicts
ALTER TABLE IF EXISTS cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS transcripts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hr_interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_insights DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS hr_users DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for cases table
DROP POLICY IF EXISTS "Anyone can create cases" ON cases;
DROP POLICY IF EXISTS "Anyone can view cases" ON cases;
DROP POLICY IF EXISTS "Anyone can read cases" ON cases;
DROP POLICY IF EXISTS "Public can create cases" ON cases;
DROP POLICY IF EXISTS "Public can read cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can delete cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can update cases" ON cases;

-- Drop ALL existing policies for transcripts table
DROP POLICY IF EXISTS "Anyone can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Anyone can read transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can create transcripts" ON transcripts;
DROP POLICY IF EXISTS "Public can read transcripts" ON transcripts;
DROP POLICY IF EXISTS "Authenticated users can update transcripts" ON transcripts;

-- Drop ALL existing policies for hr_interactions table
DROP POLICY IF EXISTS "Anyone can create hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Anyone can read hr_interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can create interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Public can read interactions" ON hr_interactions;
DROP POLICY IF EXISTS "Authenticated users can update interactions" ON hr_interactions;

-- Drop ALL existing policies for ai_insights table
DROP POLICY IF EXISTS "Anyone can create ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Anyone can read ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can create insights" ON ai_insights;
DROP POLICY IF EXISTS "Public can read insights" ON ai_insights;
DROP POLICY IF EXISTS "Authenticated users can update insights" ON ai_insights;

-- Drop ALL existing policies for hr_users table
DROP POLICY IF EXISTS "Anyone can read hr_users" ON hr_users;
DROP POLICY IF EXISTS "Public can read hr_users" ON hr_users;
DROP POLICY IF EXISTS "Authenticated users can manage hr_users" ON hr_users;

-- Now enable RLS on all tables
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_users ENABLE ROW LEVEL SECURITY;

-- Create policies for cases table
CREATE POLICY "Anyone can create cases" ON cases
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read cases" ON cases
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update cases" ON cases
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete cases" ON cases
  FOR DELETE 
  TO authenticated
  USING (true);

-- Create policies for transcripts table
CREATE POLICY "Anyone can create transcripts" ON transcripts
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read transcripts" ON transcripts
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update transcripts" ON transcripts
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for hr_interactions table
CREATE POLICY "Anyone can create hr_interactions" ON hr_interactions
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read hr_interactions" ON hr_interactions
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update interactions" ON hr_interactions
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for ai_insights table
CREATE POLICY "Anyone can create ai_insights" ON ai_insights
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read ai_insights" ON ai_insights
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can update insights" ON ai_insights
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for hr_users table
CREATE POLICY "Anyone can read hr_users" ON hr_users
  FOR SELECT 
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage hr_users" ON hr_users
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);