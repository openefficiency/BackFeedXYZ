/*
  # Create Optimized Views for HR Dashboard

  1. Views Created
    - case_summary_view: Complete case information with related data
    - dashboard_analytics_view: Pre-calculated analytics for dashboard
    - case_timeline_view: Chronological case activity

  2. Performance Benefits
    - Reduces complex JOIN queries in frontend
    - Pre-calculates common aggregations
    - Optimizes dashboard loading times
*/

-- Create comprehensive case summary view
CREATE OR REPLACE VIEW case_summary_view AS
SELECT 
  c.id,
  c.confirmation_code,
  c.category,
  c.summary,
  c.severity,
  c.status,
  c.priority,
  c.metadata,
  c.created_at,
  c.updated_at,
  
  -- Transcript information
  t.raw_transcript,
  t.processed_summary,
  t.sentiment_score,
  
  -- Interaction counts
  (SELECT COUNT(*) FROM hr_interactions hi WHERE hi.case_id = c.id) as interaction_count,
  (SELECT COUNT(*) FROM hr_interactions hi WHERE hi.case_id = c.id AND hi.sender_type = 'employee') as employee_messages,
  (SELECT COUNT(*) FROM hr_interactions hi WHERE hi.case_id = c.id AND hi.sender_type = 'hr_manager') as hr_messages,
  
  -- AI insights
  (SELECT COUNT(*) FROM ai_insights ai WHERE ai.case_id = c.id) as ai_insights_count,
  
  -- Latest interaction
  (SELECT hi.created_at FROM hr_interactions hi WHERE hi.case_id = c.id ORDER BY hi.created_at DESC LIMIT 1) as last_interaction_at,
  (SELECT hi.sender_type FROM hr_interactions hi WHERE hi.case_id = c.id ORDER BY hi.created_at DESC LIMIT 1) as last_interaction_sender,
  
  -- AI processing indicators
  EXISTS(SELECT 1 FROM ai_insights ai WHERE ai.case_id = c.id AND ai.insight_type LIKE '%elevenlabs%') as has_ai_processing,
  EXISTS(SELECT 1 FROM ai_insights ai WHERE ai.case_id = c.id AND ai.insight_type = 'elevenlabs_conversation') as has_conversation_ai,
  
  -- Urgency indicators from AI
  COALESCE((
    SELECT jsonb_array_length(ai.content->'urgency_indicators')
    FROM ai_insights ai 
    WHERE ai.case_id = c.id AND ai.insight_type = 'elevenlabs_conversation'
    LIMIT 1
  ), 0) as urgency_indicator_count,
  
  -- Key topics from AI
  (
    SELECT ai.content->'key_topics'
    FROM ai_insights ai 
    WHERE ai.case_id = c.id AND ai.insight_type = 'elevenlabs_conversation'
    LIMIT 1
  ) as key_topics,
  
  -- Case title from AI
  (
    SELECT ai.content->>'case_title'
    FROM ai_insights ai 
    WHERE ai.case_id = c.id AND ai.insight_type = 'elevenlabs_conversation'
    LIMIT 1
  ) as ai_generated_title

FROM cases c
LEFT JOIN transcripts t ON c.id = t.case_id;

-- Create dashboard analytics view
CREATE OR REPLACE VIEW dashboard_analytics_view AS
SELECT 
  -- Case counts by status
  COUNT(*) FILTER (WHERE status = 'open') as open_cases,
  COUNT(*) FILTER (WHERE status = 'investigating') as investigating_cases,
  COUNT(*) FILTER (WHERE status = 'closed') as closed_cases,
  COUNT(*) as total_cases,
  
  -- Case counts by priority
  COUNT(*) FILTER (WHERE priority = 'critical') as critical_cases,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_cases,
  COUNT(*) FILTER (WHERE priority = 'high') as high_cases,
  COUNT(*) FILTER (WHERE priority = 'normal') as normal_cases,
  COUNT(*) FILTER (WHERE priority = 'low') as low_cases,
  
  -- Case counts by category
  COUNT(*) FILTER (WHERE category = 'Workplace Safety') as safety_cases,
  COUNT(*) FILTER (WHERE category = 'Harassment') as harassment_cases,
  COUNT(*) FILTER (WHERE category = 'Discrimination') as discrimination_cases,
  COUNT(*) FILTER (WHERE category = 'Policy Violation') as policy_cases,
  COUNT(*) FILTER (WHERE category = 'Work-Life Balance') as worklife_cases,
  COUNT(*) FILTER (WHERE category = 'Workplace Environment') as environment_cases,
  COUNT(*) FILTER (WHERE category = 'Benefits Inquiry') as benefits_cases,
  COUNT(*) FILTER (WHERE category = 'General Feedback') as general_cases,
  
  -- AI processing statistics
  COUNT(*) FILTER (WHERE EXISTS(
    SELECT 1 FROM ai_insights ai 
    WHERE ai.case_id = cases.id AND ai.insight_type LIKE '%elevenlabs%'
  )) as ai_processed_cases,
  
  -- Time-based statistics
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) as cases_today,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as cases_this_week,
  COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as cases_this_month,
  
  -- Average response times
  AVG(EXTRACT(EPOCH FROM (
    SELECT MIN(hi.created_at) 
    FROM hr_interactions hi 
    WHERE hi.case_id = cases.id AND hi.sender_type = 'hr_manager'
  ) - cases.created_at) / 3600) FILTER (WHERE status != 'open') as avg_response_time_hours,
  
  -- Sentiment analysis
  AVG((SELECT sentiment_score FROM transcripts t WHERE t.case_id = cases.id LIMIT 1)) as avg_sentiment_score

FROM cases;

-- Create case timeline view for activity tracking
CREATE OR REPLACE VIEW case_timeline_view AS
SELECT 
  c.id as case_id,
  c.confirmation_code,
  'case_created' as event_type,
  c.summary as event_description,
  'system' as actor_type,
  'System' as actor_name,
  c.created_at as event_time,
  jsonb_build_object(
    'category', c.category,
    'severity', c.severity,
    'status', c.status
  ) as event_metadata
FROM cases c

UNION ALL

SELECT 
  hi.case_id,
  c.confirmation_code,
  'interaction' as event_type,
  hi.message as event_description,
  hi.sender_type as actor_type,
  hi.sender_name as actor_name,
  hi.created_at as event_time,
  hi.metadata as event_metadata
FROM hr_interactions hi
JOIN cases c ON hi.case_id = c.id

UNION ALL

SELECT 
  ai.case_id,
  c.confirmation_code,
  'ai_insight' as event_type,
  ai.insight_type as event_description,
  'system' as actor_type,
  'AI System' as actor_name,
  ai.created_at as event_time,
  ai.content as event_metadata
FROM ai_insights ai
JOIN cases c ON ai.case_id = c.id

ORDER BY event_time DESC;

-- Grant access to views
GRANT SELECT ON case_summary_view TO anon, authenticated;
GRANT SELECT ON dashboard_analytics_view TO anon, authenticated;
GRANT SELECT ON case_timeline_view TO anon, authenticated;