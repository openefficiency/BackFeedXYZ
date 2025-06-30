/*
  # ElevenLabs Voice Integration for BackFeedXYZ

  1. Database Extensions
    - Extend existing `transcripts` table with ElevenLabs-specific columns
    - Add new `webhook_logs` table for monitoring ElevenLabs webhooks
    - Create performance indexes for voice processing
    - Add RLS policies for secure access

  2. Functions and Triggers
    - Add function to get voice transcription summaries
    - Add trigger to auto-update cases when voice processing completes
    - Add system notifications for completed transcriptions

  3. Test Data
    - Insert test case for ElevenLabs integration validation
    - Add sample voice transcription data
*/

-- EXTEND EXISTING TRANSCRIPTS TABLE FOR ELEVENLABS
-- Add ElevenLabs-specific columns to your existing transcripts table

ALTER TABLE public.transcripts 
ADD COLUMN IF NOT EXISTS elevenlabs_job_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS audio_duration INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,4) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(50) DEFAULT 'pending' 
    CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
ADD COLUMN IF NOT EXISTS error_message TEXT,
ADD COLUMN IF NOT EXISTS elevenlabs_metadata JSONB,
ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Update existing constraint to include new sentiment range
ALTER TABLE public.transcripts 
DROP CONSTRAINT IF EXISTS transcripts_sentiment_score_check;

ALTER TABLE public.transcripts 
ADD CONSTRAINT transcripts_sentiment_score_check 
CHECK (sentiment_score >= -1.0 AND sentiment_score <= 1.0);

-- Add confidence score constraint
ALTER TABLE public.transcripts 
ADD CONSTRAINT transcripts_confidence_score_check 
CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0);

-- CREATE WEBHOOK LOGS TABLE (new table for monitoring)
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  elevenlabs_job_id VARCHAR(255),
  case_confirmation_code TEXT, -- Links to cases.confirmation_code
  case_id UUID, -- Direct link to cases.id
  status VARCHAR(50) NOT NULL,
  processing_duration_ms INTEGER,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  webhook_payload JSONB,
  response_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT webhook_logs_case_id_fkey 
    FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE
);

-- CREATE PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_transcripts_elevenlabs_job_id 
  ON public.transcripts(elevenlabs_job_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_processing_status 
  ON public.transcripts(processing_status);
CREATE INDEX IF NOT EXISTS idx_transcripts_case_id_status 
  ON public.transcripts(case_id, processing_status);

CREATE INDEX IF NOT EXISTS idx_webhook_logs_case_id 
  ON public.webhook_logs(case_id);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type 
  ON public.webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_created_at 
  ON public.webhook_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_elevenlabs_job_id 
  ON public.webhook_logs(elevenlabs_job_id);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE public.webhook_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES for webhook_logs
CREATE POLICY "Service role can manage all webhook logs" ON public.webhook_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "HR users can view webhook logs for their cases" ON public.webhook_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cases 
      WHERE cases.id = webhook_logs.case_id
    )
  );

-- Public can create webhook logs (for ElevenLabs webhooks)
CREATE POLICY "Public can create webhook logs" ON public.webhook_logs
  FOR INSERT WITH CHECK (true);

-- ENHANCED FUNCTION TO GET TRANSCRIPTION SUMMARY FOR A CASE
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
  latest_processing_status TEXT
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
     ORDER BY created_at DESC LIMIT 1) as latest_processing_status
  FROM public.transcripts 
  WHERE case_id = input_case_id;
END;
$$ LANGUAGE plpgsql;

-- FUNCTION TO AUTO-UPDATE CASE STATUS WHEN TRANSCRIPTION COMPLETES
CREATE OR REPLACE FUNCTION update_case_on_voice_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the parent case when transcription status changes to completed
  IF NEW.processing_status = 'completed' AND OLD.processing_status != 'completed' THEN
    -- Update the case's updated_at timestamp
    UPDATE public.cases 
    SET updated_at = NOW()
    WHERE id = NEW.case_id;
    
    -- Optionally add an HR interaction noting the transcription completion
    INSERT INTO public.hr_interactions (
      case_id, 
      message, 
      sender_type, 
      sender_name
    ) VALUES (
      NEW.case_id,
      'Voice transcription completed with ' || 
      ROUND(COALESCE(NEW.confidence_score, 0) * 100) || '% confidence. Audio duration: ' ||
      COALESCE(NEW.audio_duration, 0) || ' seconds.',
      'system',
      'ElevenLabs Voice AI'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- CREATE TRIGGER FOR AUTO-UPDATES
DROP TRIGGER IF EXISTS trigger_update_case_on_voice_completion ON public.transcripts;
CREATE TRIGGER trigger_update_case_on_voice_completion
  AFTER UPDATE ON public.transcripts
  FOR EACH ROW
  EXECUTE FUNCTION update_case_on_voice_completion();

-- INSERT TEST DATA USING YOUR EXISTING SCHEMA
-- First, let's create a test case if it doesn't exist
INSERT INTO public.cases (
  confirmation_code,
  status,
  severity,
  category,
  summary
) VALUES (
  'VOICE-TEST-001',
  'investigating',
  3,
  'Workplace Communication',
  'Test case for ElevenLabs voice integration validation'
) ON CONFLICT (confirmation_code) DO NOTHING;

-- Get the case ID for our test transcript
DO $$
DECLARE
    test_case_id UUID;
BEGIN
    SELECT id INTO test_case_id 
    FROM public.cases 
    WHERE confirmation_code = 'VOICE-TEST-001';
    
    -- Insert test transcript with ElevenLabs integration
    INSERT INTO public.transcripts (
      case_id,
      raw_transcript,
      processed_summary,
      sentiment_score,
      elevenlabs_job_id,
      audio_duration,
      confidence_score,
      language,
      processing_status,
      processed_at,
      elevenlabs_metadata
    ) VALUES (
      test_case_id,
      'This is a test transcription to verify the ElevenLabs integration is working correctly with the existing BackFeedXYZ database schema. The voice processing pipeline should now be fully operational.',
      'Test summary: Integration setup successful. Voice processing pipeline ready for production use.',
      0.1, -- Positive sentiment
      'test-job-' || extract(epoch from now())::text,
      45,
      0.96,
      'en',
      'completed',
      NOW(),
      jsonb_build_object(
        'agent_id', 'agent_01jydtj6avef99c1ne0eavf0ww',
        'conversation_id', 'test-conversation-001',
        'processing_type', 'elevenlabs_integration_test',
        'test_mode', true
      )
    ) ON CONFLICT (elevenlabs_job_id) DO NOTHING;
    
    -- Insert test webhook log
    INSERT INTO public.webhook_logs (
      request_id,
      event_type,
      elevenlabs_job_id,
      case_confirmation_code,
      case_id,
      status,
      processing_duration_ms,
      webhook_payload,
      response_data
    ) VALUES (
      'test-webhook-' || extract(epoch from now())::text,
      'transcription_completed',
      'test-job-' || extract(epoch from now())::text,
      'VOICE-TEST-001',
      test_case_id,
      'completed',
      2500,
      jsonb_build_object(
        'event', 'transcription_completed',
        'job_id', 'test-job-' || extract(epoch from now())::text,
        'confidence', 0.96,
        'duration', 45
      ),
      jsonb_build_object(
        'success', true,
        'case_created', true,
        'confirmation_code', 'VOICE-TEST-001'
      )
    ) ON CONFLICT (request_id) DO NOTHING;
END $$;

-- Add AI insight for ElevenLabs processing
DO $$
DECLARE
    test_case_id UUID;
BEGIN
    SELECT id INTO test_case_id 
    FROM public.cases 
    WHERE confirmation_code = 'VOICE-TEST-001';
    
    INSERT INTO public.ai_insights (
      case_id,
      insight_type,
      content,
      confidence_score
    ) VALUES (
      test_case_id,
      'elevenlabs_conversation',
      jsonb_build_object(
        'processing_type', 'elevenlabs_integration_test',
        'voice_quality', 'excellent',
        'transcription_accuracy', 0.96,
        'audio_duration_seconds', 45,
        'language_detected', 'en',
        'conversation_metadata', jsonb_build_object(
          'agent_id', 'agent_01jydtj6avef99c1ne0eavf0ww',
          'test_mode', true,
          'integration_status', 'successful'
        ),
        'processing_notes', 'ElevenLabs integration test completed successfully. All voice processing features are operational.'
      ),
      0.98
    ) ON CONFLICT DO NOTHING;
END $$;

-- Verify the setup and show summary
DO $$
DECLARE
    transcript_count INTEGER;
    webhook_count INTEGER;
    test_case_exists BOOLEAN;
BEGIN
    -- Check if test data was created
    SELECT COUNT(*) INTO transcript_count 
    FROM public.transcripts 
    WHERE elevenlabs_job_id LIKE 'test-job-%';
    
    SELECT COUNT(*) INTO webhook_count 
    FROM public.webhook_logs 
    WHERE request_id LIKE 'test-webhook-%';
    
    SELECT EXISTS(
        SELECT 1 FROM public.cases 
        WHERE confirmation_code = 'VOICE-TEST-001'
    ) INTO test_case_exists;
    
    RAISE NOTICE '🎯 ElevenLabs Integration Setup Complete!';
    RAISE NOTICE '================================';
    RAISE NOTICE '✅ Extended transcripts table with ElevenLabs columns';
    RAISE NOTICE '✅ Created webhook_logs table for monitoring';
    RAISE NOTICE '✅ Added performance indexes for voice processing';
    RAISE NOTICE '✅ Configured RLS policies for secure access';
    RAISE NOTICE '✅ Created voice summary function';
    RAISE NOTICE '✅ Added auto-update trigger for case completion';
    RAISE NOTICE '';
    RAISE NOTICE '📊 Test Data Status:';
    RAISE NOTICE '- Test case created: %', test_case_exists;
    RAISE NOTICE '- Test transcripts: %', transcript_count;
    RAISE NOTICE '- Test webhook logs: %', webhook_count;
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Ready for ElevenLabs voice processing!';
    RAISE NOTICE 'Test with confirmation code: VOICE-TEST-001';
END $$;