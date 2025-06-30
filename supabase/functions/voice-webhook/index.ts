import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ElevenLabsWebhookPayload {
  event_type: string;
  job_id: string;
  status: string;
  metadata?: {
    case_id?: string;
    confirmation_code?: string;
  };
  error?: string;
  transcript?: string;
  summary?: string;
  confidence?: number;
  sentiment?: number;
  audio_duration?: number;
  language?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }

  const startTime = Date.now()
  let caseId: string | null = null
  let confirmationCode: string | null = null

  try {
    // Initialize Supabase client with service role key
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🎯 Voice webhook received from ElevenLabs')
    
    const payload: ElevenLabsWebhookPayload = await req.json()
    console.log('Payload:', payload)

    const { event_type, job_id, status, metadata, error: errorMessage } = payload
    caseId = metadata?.case_id || null
    confirmationCode = metadata?.confirmation_code || null
    const requestId = `req-${Date.now()}`

    // Log the webhook event
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        request_id: requestId,
        event_type: event_type || 'unknown',
        elevenlabs_job_id: job_id || 'unknown',
        case_id: caseId,
        case_confirmation_code: confirmationCode,
        status: 'received',
        webhook_payload: payload,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      })

    if (logError) {
      console.error('Failed to log webhook:', logError)
    }

    // Process based on event type
    switch (event_type) {
      case 'generation.completed':
      case 'transcription.completed':
        if (status === 'success' || status === 'completed') {
          await handleSuccessfulVoiceTranscription(supabase, job_id, caseId, confirmationCode, payload)
        } else {
          await handleFailedVoiceTranscription(supabase, job_id, caseId, confirmationCode, errorMessage)
        }
        break
        
      case 'generation.failed':
      case 'transcription.failed':
        await handleFailedVoiceTranscription(supabase, job_id, caseId, confirmationCode, errorMessage)
        break
        
      case 'generation.started':
      case 'transcription.started':
        await handleVoiceTranscriptionStarted(supabase, job_id, caseId, confirmationCode)
        break
        
      default:
        console.log(`Unhandled event type: ${event_type}`)
        // For testing - create a basic transcription entry
        if (job_id && caseId) {
          await handleSuccessfulVoiceTranscription(supabase, job_id, caseId, confirmationCode, payload)
        }
    }

    // Update webhook log as completed
    const processingTime = Date.now() - startTime
    await supabase
      .from('webhook_logs')
      .update({
        status: 'completed',
        processing_duration_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('request_id', requestId)

    // Send success response
    return new Response(
      JSON.stringify({
        status: 'processed',
        message: 'Voice webhook received and processed successfully',
        request_id: requestId,
        case_id: caseId,
        confirmation_code: confirmationCode,
        elevenlabs_job_id: job_id,
        processing_time_ms: processingTime,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('Voice webhook processing error:', error)
    
    // Log the failure
    const processingTime = Date.now() - startTime
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabase
        .from('webhook_logs')
        .insert({
          request_id: `error-${Date.now()}`,
          event_type: 'webhook.error',
          elevenlabs_job_id: 'unknown',
          case_id: caseId || null,
          case_confirmation_code: confirmationCode || null,
          status: 'failed',
          error_message: error.message,
          processing_duration_ms: processingTime
        })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message,
        case_id: caseId,
        confirmation_code: confirmationCode
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Handle successful voice transcription completion
async function handleSuccessfulVoiceTranscription(
  supabase: any,
  jobId: string,
  caseId: string | null,
  confirmationCode: string | null,
  webhookData: ElevenLabsWebhookPayload
) {
  console.log(`Processing successful voice transcription for job ${jobId}, case ${caseId || confirmationCode}`)
  
  try {
    // If we don't have case ID but have confirmation code, look it up
    if (!caseId && confirmationCode) {
      const { data: caseData } = await supabase
        .from('cases')
        .select('id')
        .eq('confirmation_code', confirmationCode)
        .single()
      
      if (caseData) {
        caseId = caseData.id
      }
    }

    if (!caseId) {
      throw new Error('No valid case ID found for transcription')
    }

    // Prepare transcription data
    const transcriptData = {
      raw_transcript: webhookData.transcript || 'Voice transcription completed via ElevenLabs webhook.',
      processed_summary: webhookData.summary || 'Voice processing completed successfully.',
      sentiment_score: webhookData.sentiment || 0.0,
      confidence_score: webhookData.confidence || 0.95,
      audio_duration: webhookData.audio_duration || 30,
      language: webhookData.language || 'en'
    }

    // Store transcription in database
    const { error } = await supabase
      .from('transcripts')
      .upsert({
        case_id: caseId,
        elevenlabs_job_id: jobId,
        raw_transcript: transcriptData.raw_transcript,
        processed_summary: transcriptData.processed_summary,
        sentiment_score: transcriptData.sentiment_score,
        confidence_score: transcriptData.confidence_score,
        audio_duration: transcriptData.audio_duration,
        language: transcriptData.language,
        processing_status: 'completed',
        elevenlabs_metadata: webhookData,
        webhook_received_at: new Date().toISOString(),
        processed_at: new Date().toISOString()
      }, {
        onConflict: 'elevenlabs_job_id'
      })

    if (error) {
      throw new Error(`Failed to store voice transcription: ${error.message}`)
    }

    // Create an AI insight for the voice transcription
    await supabase
      .from('ai_insights')
      .insert({
        case_id: caseId,
        insight_type: 'elevenlabs_conversation',
        content: {
          transcript: transcriptData.raw_transcript,
          summary: transcriptData.processed_summary,
          confidence: transcriptData.confidence_score,
          sentiment: transcriptData.sentiment_score,
          audio_duration: transcriptData.audio_duration,
          language: transcriptData.language,
          job_id: jobId,
          processing_type: 'elevenlabs_webhook',
          webhook_processed: true
        },
        confidence_score: transcriptData.confidence_score
      })

    console.log(`✅ Successfully stored voice transcription for case ${caseId}`)
    
  } catch (error: any) {
    console.error(`❌ Failed to process successful voice transcription:`, error)
    throw error
  }
}

// Handle failed voice transcription
async function handleFailedVoiceTranscription(
  supabase: any,
  jobId: string,
  caseId: string | null,
  confirmationCode: string | null,
  errorMessage?: string
) {
  console.error(`Voice transcription failed for job ${jobId}, case ${caseId || confirmationCode}:`, errorMessage)
  
  try {
    // Look up case ID if needed
    if (!caseId && confirmationCode) {
      const { data: caseData } = await supabase
        .from('cases')
        .select('id')
        .eq('confirmation_code', confirmationCode)
        .single()
      
      if (caseData) {
        caseId = caseData.id
      }
    }

    if (caseId) {
      // Store failed transcription
      await supabase
        .from('transcripts')
        .upsert({
          case_id: caseId,
          elevenlabs_job_id: jobId,
          processing_status: 'failed',
          error_message: errorMessage || 'Voice transcription failed',
          webhook_received_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        }, {
          onConflict: 'elevenlabs_job_id'
        })
    }
    
    console.log(`📝 Logged failed voice transcription for case ${caseId || confirmationCode}`)
  } catch (error: any) {
    console.error('Failed to log voice transcription failure:', error)
  }
}

// Handle voice transcription started
async function handleVoiceTranscriptionStarted(
  supabase: any,
  jobId: string,
  caseId: string | null,
  confirmationCode: string | null
) {
  console.log(`Voice transcription started for job ${jobId}, case ${caseId || confirmationCode}`)
  
  try {
    // Look up case ID if needed
    if (!caseId && confirmationCode) {
      const { data: caseData } = await supabase
        .from('cases')
        .select('id')
        .eq('confirmation_code', confirmationCode)
        .single()
      
      if (caseData) {
        caseId = caseData.id
      }
    }

    if (caseId) {
      // Store processing status
      await supabase
        .from('transcripts')
        .upsert({
          case_id: caseId,
          elevenlabs_job_id: jobId,
          processing_status: 'processing',
          webhook_received_at: new Date().toISOString()
        }, {
          onConflict: 'elevenlabs_job_id'
        })
    }
    
    console.log(`📝 Logged voice transcription start for case ${caseId || confirmationCode}`)
  } catch (error: any) {
    console.error('Failed to log voice transcription start:', error)
  }
}