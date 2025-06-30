/*
  # Update AI Insights Table for Enhanced Frontend Support

  1. Updates
    - Expand ai_insights insight_type constraint to support all frontend types
    - Add missing indexes for better performance
    - Update constraint to match frontend expectations

  2. New Insight Types
    - elevenlabs_conversation (for ElevenLabs widget processing)
    - elevenlabs_realtime (for real-time processing)
    - deepgram_realtime (for voice processing)
    - deepgram_processing (for transcript processing)
    - conversation_quality (for conversation analysis)
    - emotional_analysis (for emotional insights)
*/

-- Drop existing constraint if it exists
ALTER TABLE ai_insights DROP CONSTRAINT IF EXISTS ai_insights_insight_type_check;

-- Add updated constraint with all required insight types
ALTER TABLE ai_insights ADD CONSTRAINT ai_insights_insight_type_check 
CHECK (insight_type = ANY (ARRAY[
  'risk_assessment'::text,
  'next_steps'::text, 
  'similar_cases'::text,
  'sentiment_analysis'::text,
  'elevenlabs_conversation'::text,
  'elevenlabs_realtime'::text,
  'deepgram_realtime'::text,
  'deepgram_processing'::text,
  'conversation_quality'::text,
  'emotional_analysis'::text
]));

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_insights_created_at ON ai_insights(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_confidence ON ai_insights(confidence_score DESC);

-- Add index for JSONB content queries (for searching within AI insights)
CREATE INDEX IF NOT EXISTS idx_ai_insights_content_gin ON ai_insights USING GIN (content);