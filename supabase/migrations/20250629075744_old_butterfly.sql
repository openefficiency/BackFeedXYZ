/*
  # Update HR Interactions Table for Better Communication Tracking

  1. Updates
    - Add additional indexes for better performance
    - Add metadata column for storing interaction context
    - Update sender_type constraint if needed

  2. Performance Improvements
    - Index on sender_type for filtering
    - Index on created_at for chronological ordering
    - Index on case_id + created_at for case timeline queries
*/

-- Add metadata column for storing additional interaction context
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hr_interactions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE hr_interactions ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hr_interactions_sender_type ON hr_interactions(sender_type);
CREATE INDEX IF NOT EXISTS idx_hr_interactions_created_at ON hr_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hr_interactions_case_timeline ON hr_interactions(case_id, created_at DESC);

-- Add GIN index for metadata searches
CREATE INDEX IF NOT EXISTS idx_hr_interactions_metadata_gin ON hr_interactions USING GIN (metadata);

-- Update RLS policies to ensure proper access
DROP POLICY IF EXISTS "Authenticated users can update interactions" ON hr_interactions;
CREATE POLICY "Authenticated users can update interactions"
  ON hr_interactions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);