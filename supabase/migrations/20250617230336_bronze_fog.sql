/*
  # Create HR interactions table for communication

  1. New Tables
    - `hr_interactions`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key to cases)
      - `message` (text) - message content
      - `sender_type` (text) - employee, hr_manager, or system
      - `sender_name` (text) - display name for sender
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hr_interactions` table
    - Add policies for reading and creating messages
*/

CREATE TABLE IF NOT EXISTS hr_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  message text NOT NULL,
  sender_type text NOT NULL CHECK (sender_type IN ('employee', 'hr_manager', 'system')),
  sender_name text DEFAULT 'Anonymous',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hr_interactions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view all interactions
CREATE POLICY "Authenticated users can view interactions"
  ON hr_interactions
  FOR SELECT
  TO authenticated
  USING (true);

-- Anyone can create interactions (for anonymous employee responses)
CREATE POLICY "Anyone can create interactions"
  ON hr_interactions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hr_interactions_case_id ON hr_interactions(case_id);
CREATE INDEX IF NOT EXISTS idx_hr_interactions_created_at ON hr_interactions(created_at DESC);