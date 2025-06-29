/*
  # Create Utility Functions for Frontend Support

  1. Functions Created
    - get_case_analytics(): Returns dashboard analytics
    - get_case_with_details(): Returns complete case information
    - update_case_metadata(): Updates case metadata safely
    - search_cases(): Advanced case search functionality

  2. Benefits
    - Reduces frontend complexity
    - Ensures consistent data access patterns
    - Provides optimized queries for common operations
*/

-- Function to get dashboard analytics
CREATE OR REPLACE FUNCTION get_case_analytics()
RETURNS TABLE (
  metric_name text,
  metric_value bigint,
  metric_category text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'total_cases'::text, COUNT(*)::bigint, 'overview'::text FROM cases
  UNION ALL
  SELECT 'open_cases'::text, COUNT(*) FILTER (WHERE status = 'open')::bigint, 'status'::text FROM cases
  UNION ALL
  SELECT 'investigating_cases'::text, COUNT(*) FILTER (WHERE status = 'investigating')::bigint, 'status'::text FROM cases
  UNION ALL
  SELECT 'closed_cases'::text, COUNT(*) FILTER (WHERE status = 'closed')::bigint, 'status'::text FROM cases
  UNION ALL
  SELECT 'critical_cases'::text, COUNT(*) FILTER (WHERE priority = 'critical')::bigint, 'priority'::text FROM cases
  UNION ALL
  SELECT 'urgent_cases'::text, COUNT(*) FILTER (WHERE priority = 'urgent')::bigint, 'priority'::text FROM cases
  UNION ALL
  SELECT 'ai_processed_cases'::text, COUNT(DISTINCT ai.case_id)::bigint, 'ai'::text 
  FROM ai_insights ai WHERE ai.insight_type LIKE '%elevenlabs%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get complete case details
CREATE OR REPLACE FUNCTION get_case_with_details(case_confirmation_code text)
RETURNS TABLE (
  case_data jsonb,
  transcripts_data jsonb,
  interactions_data jsonb,
  ai_insights_data jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    to_jsonb(c.*) as case_data,
    COALESCE(jsonb_agg(DISTINCT to_jsonb(t.*)) FILTER (WHERE t.id IS NOT NULL), '[]'::jsonb) as transcripts_data,
    COALESCE(jsonb_agg(DISTINCT to_jsonb(hi.*)) FILTER (WHERE hi.id IS NOT NULL), '[]'::jsonb) as interactions_data,
    COALESCE(jsonb_agg(DISTINCT to_jsonb(ai.*)) FILTER (WHERE ai.id IS NOT NULL), '[]'::jsonb) as ai_insights_data
  FROM cases c
  LEFT JOIN transcripts t ON c.id = t.case_id
  LEFT JOIN hr_interactions hi ON c.id = hi.case_id
  LEFT JOIN ai_insights ai ON c.id = ai.case_id
  WHERE c.confirmation_code = case_confirmation_code
  GROUP BY c.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to safely update case metadata
CREATE OR REPLACE FUNCTION update_case_metadata(
  case_id uuid,
  new_metadata jsonb
)
RETURNS boolean AS $$
BEGIN
  UPDATE cases 
  SET 
    metadata = COALESCE(metadata, '{}'::jsonb) || new_metadata,
    updated_at = now()
  WHERE id = case_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for advanced case search
CREATE OR REPLACE FUNCTION search_cases(
  search_term text DEFAULT '',
  status_filter text DEFAULT 'all',
  category_filter text DEFAULT 'all',
  priority_filter text DEFAULT 'all',
  limit_count integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  confirmation_code text,
  category text,
  summary text,
  severity integer,
  status text,
  priority text,
  created_at timestamptz,
  updated_at timestamptz,
  ai_title text,
  key_topics jsonb,
  urgency_count integer,
  has_ai_processing boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.confirmation_code,
    c.category,
    c.summary,
    c.severity,
    c.status,
    c.priority,
    c.created_at,
    c.updated_at,
    (ai.content->>'case_title') as ai_title,
    (ai.content->'key_topics') as key_topics,
    COALESCE((ai.content->'urgency_indicators')::jsonb ? '0', false)::int as urgency_count,
    EXISTS(SELECT 1 FROM ai_insights ai2 WHERE ai2.case_id = c.id AND ai2.insight_type LIKE '%elevenlabs%') as has_ai_processing
  FROM cases c
  LEFT JOIN ai_insights ai ON c.id = ai.case_id AND ai.insight_type = 'elevenlabs_conversation'
  WHERE 
    (search_term = '' OR 
     c.summary ILIKE '%' || search_term || '%' OR 
     c.confirmation_code ILIKE '%' || search_term || '%' OR
     c.category ILIKE '%' || search_term || '%' OR
     (ai.content->>'case_title') ILIKE '%' || search_term || '%')
    AND (status_filter = 'all' OR c.status = status_filter)
    AND (category_filter = 'all' OR c.category = category_filter)
    AND (priority_filter = 'all' OR c.priority = priority_filter)
  ORDER BY c.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_case_analytics() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_case_with_details(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_case_metadata(uuid, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION search_cases(text, text, text, text, integer) TO anon, authenticated;