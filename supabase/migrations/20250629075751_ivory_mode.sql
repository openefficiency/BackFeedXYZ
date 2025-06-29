/*
  # Update Cases Table for Enhanced Frontend Support

  1. Updates
    - Add metadata column for storing additional case context
    - Add priority calculation based on severity and category
    - Add better indexing for dashboard queries

  2. New Features
    - Case metadata for storing AI-generated titles and topics
    - Enhanced indexing for better dashboard performance
    - Support for case tagging and categorization
*/

-- Add metadata column for storing additional case context
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE cases ADD COLUMN metadata jsonb DEFAULT '{}';
  END IF;
END $$;

-- Add computed priority field based on severity and other factors
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cases' AND column_name = 'priority'
  ) THEN
    ALTER TABLE cases ADD COLUMN priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent', 'critical'));
  END IF;
END $$;

-- Add additional indexes for dashboard performance
CREATE INDEX IF NOT EXISTS idx_cases_severity ON cases(severity DESC);
CREATE INDEX IF NOT EXISTS idx_cases_priority ON cases(priority);
CREATE INDEX IF NOT EXISTS idx_cases_status_severity ON cases(status, severity DESC);
CREATE INDEX IF NOT EXISTS idx_cases_category_status ON cases(category, status);
CREATE INDEX IF NOT EXISTS idx_cases_updated_at ON cases(updated_at DESC);

-- Add GIN index for metadata searches (for AI-generated titles, topics, etc.)
CREATE INDEX IF NOT EXISTS idx_cases_metadata_gin ON cases USING GIN (metadata);

-- Create function to automatically set priority based on severity and category
CREATE OR REPLACE FUNCTION calculate_case_priority(
  p_severity integer,
  p_category text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS text AS $$
BEGIN
  -- Critical cases (severity 5 or urgent indicators)
  IF p_severity >= 5 OR (p_metadata->>'urgency_indicators')::int > 2 THEN
    RETURN 'critical';
  END IF;
  
  -- Urgent cases (severity 4 or safety/legal issues)
  IF p_severity >= 4 OR p_category IN ('Workplace Safety', 'Harassment', 'Discrimination') THEN
    RETURN 'urgent';
  END IF;
  
  -- High priority (severity 3 or policy violations)
  IF p_severity >= 3 OR p_category IN ('Policy Violation') THEN
    RETURN 'high';
  END IF;
  
  -- Low priority (severity 1)
  IF p_severity <= 1 THEN
    RETURN 'low';
  END IF;
  
  -- Default to normal
  RETURN 'normal';
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update priority
CREATE OR REPLACE FUNCTION update_case_priority()
RETURNS TRIGGER AS $$
BEGIN
  NEW.priority = calculate_case_priority(NEW.severity, NEW.category, NEW.metadata);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic priority calculation
DROP TRIGGER IF EXISTS trigger_update_case_priority ON cases;
CREATE TRIGGER trigger_update_case_priority
  BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION update_case_priority();