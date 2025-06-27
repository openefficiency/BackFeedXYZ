/*
  # Create cases table for employee feedback system

  1. New Tables
    - `cases`
      - `id` (uuid, primary key)
      - `confirmation_code` (text, unique) - 10-digit alphanumeric code for tracking
      - `status` (text) - open, investigating, closed
      - `severity` (integer) - 1-5 priority level
      - `category` (text) - type of feedback (safety, harassment, etc.)
      - `summary` (text) - AI-processed summary of the issue
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `cases` table
    - Add policy for HR users to read all cases
    - Add policy for anonymous users to create cases
*/

CREATE TABLE IF NOT EXISTS cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text UNIQUE NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed')),
  severity integer DEFAULT 3 CHECK (severity BETWEEN 1 AND 5),
  category text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- HR users can view all cases (for now, allow all authenticated users)
CREATE POLICY "Authenticated users can view all cases"
  ON cases
  FOR SELECT
  TO authenticated
  USING (true);

-- Anonymous users can create cases
CREATE POLICY "Anonymous can create cases"
  ON cases
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cases_confirmation_code ON cases(confirmation_code);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_at ON cases(created_at DESC);