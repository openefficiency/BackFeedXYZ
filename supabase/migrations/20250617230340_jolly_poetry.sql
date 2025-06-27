/*
  # Create AI insights table for automated analysis

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `case_id` (uuid, foreign key to cases)
      - `insight_type` (text) - type of insight generated
      - `content` (jsonb) - structured insight data
      - `confidence_score` (decimal) - AI confidence level
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `ai_insights` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  insight_type text NOT NULL CHECK (insight_type IN ('risk_assessment', 'next_steps', 'similar_cases', 'sentiment_analysis')),
  content jsonb NOT NULL,
  confidence_score decimal(3,2) DEFAULT 0.0 CHECK (confidence_score BETWEEN 0.0 AND 1.0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view insights
CREATE POLICY "Authenticated users can view insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (true);

-- System can insert insights
CREATE POLICY "System can insert insights"
  ON ai_insights
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ai_insights_case_id ON ai_insights(case_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);