/*
  # Fix get_case_voice_summary function type mismatch

  1. Function Fix
    - Update the RETURNS TABLE clause to match actual column types
    - Change latest_processing_status from TEXT to VARCHAR(50)
    - This resolves the type mismatch error

  2. Verification
    - Test the function with existing case data
    - Ensure all return types match database schema
*/

-- DROP AND RECREATE THE FUNCTION WITH CORRECT TYPES
DROP FUNCTION IF EXISTS get_case_voice_summary(UUID);

CREATE OR REPLACE FUNCTION get_case_voice_summary(input_case_id UUID)
RETURNS TABLE (
  total_transcripts BIGINT,
  completed_transcripts BIGINT,
  processing_transcripts BIGINT,
  failed_transcripts BIGINT,
  total_audio_duration INTEGER,
  avg_confidence DECIMAL,
  avg_sentiment DECIMAL,
  latest_transcript TEXT,
  latest_summary TEXT,
  latest_processing_status VARCHAR(50)  -- Changed from TEXT to VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_transcripts,
    COUNT(CASE WHEN processing_status = 'completed' THEN 1 END) as completed_transcripts,
    COUNT(CASE WHEN processing_status = 'processing' THEN 1 END) as processing_transcripts,
    COUNT(CASE WHEN processing_status = 'failed' THEN 1 END) as failed_transcripts,
    COALESCE(SUM(audio_duration), 0)::INTEGER as total_audio_duration,
    ROUND(AVG(confidence_score), 4) as avg_confidence,
    ROUND(AVG(sentiment_score), 4) as avg_sentiment,
    (SELECT raw_transcript FROM public.transcripts 
     WHERE case_id = input_case_id AND processing_status = 'completed' 
     ORDER BY processed_at DESC LIMIT 1) as latest_transcript,
    (SELECT processed_summary FROM public.transcripts 
     WHERE case_id = input_case_id AND processing_status = 'completed' 
     ORDER BY processed_at DESC LIMIT 1) as latest_summary,
    (SELECT processing_status FROM public.transcripts 
     WHERE case_id = input_case_id 
     ORDER BY created_at DESC LIMIT 1)::VARCHAR(50) as latest_processing_status  -- Explicit cast to VARCHAR(50)
  FROM public.transcripts 
  WHERE case_id = input_case_id;
END;
$$ LANGUAGE plpgsql;

-- Test the function with a known case ID
DO $$
DECLARE
    test_case_id UUID;
    result_record RECORD;
BEGIN
    -- Get a test case ID
    SELECT id INTO test_case_id 
    FROM public.cases 
    WHERE confirmation_code = 'VOICE-TEST-001'
    LIMIT 1;
    
    IF test_case_id IS NOT NULL THEN
        -- Test the function
        SELECT * INTO result_record 
        FROM get_case_voice_summary(test_case_id);
        
        RAISE NOTICE '🧪 Function Test Results:';
        RAISE NOTICE '- Total transcripts: %', result_record.total_transcripts;
        RAISE NOTICE '- Completed transcripts: %', result_record.completed_transcripts;
        RAISE NOTICE '- Processing transcripts: %', result_record.processing_transcripts;
        RAISE NOTICE '- Failed transcripts: %', result_record.failed_transcripts;
        RAISE NOTICE '- Total audio duration: % seconds', result_record.total_audio_duration;
        RAISE NOTICE '- Average confidence: %', result_record.avg_confidence;
        RAISE NOTICE '- Average sentiment: %', result_record.avg_sentiment;
        RAISE NOTICE '- Latest processing status: %', result_record.latest_processing_status;
        RAISE NOTICE '';
        RAISE NOTICE '✅ Function test completed successfully!';
    ELSE
        RAISE NOTICE '⚠️ No test case found. Function created but not tested.';
    END IF;
END $$;

-- Verify function signature
SELECT 
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_case_voice_summary';

-- Show success message
SELECT '✅ get_case_voice_summary function fixed and ready to use!' as status;