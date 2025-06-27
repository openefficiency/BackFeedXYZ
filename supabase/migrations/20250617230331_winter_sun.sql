/*
  # Create transcripts table for audio processing

  1. New Tables
    - `transcripts`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key to cases)
      - `raw_transcript` (text) - original speech-to-text output
      - `processed_summary` (text) - AI-processed summary
      - `sentiment_score` (decimal) - sentiment analysis score (-1 to 1)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `transcripts` table
    - Add policy for authenticated users to read transcripts
*/

CREATE TABLE IF NOT EXISTS transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  raw_transcript text NOT NULL,
  processed_summary text,
  sentiment_score decimal(3,2) DEFAULT 0.0 CHECK (sentiment_score BETWEEN -1.0 AND 1.0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view transcripts
CREATE POLICY "Authenticated users can view transcripts"
  ON transcripts
  FOR SELECT
  TO authenticated
  USING (true);

-- System can insert transcripts
CREATE POLICY "System can insert transcripts"
  ON transcripts
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transcripts_case_id ON transcripts(case_id);