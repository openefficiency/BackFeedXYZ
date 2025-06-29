/**
 * Netlify Edge Function for ElevenLabs Webhook Integration
 * Generates tracking codes when triggered by conversation events
 */

interface ElevenLabsWebhookPayload {
  event_type: string;
  conversation_id?: string;
  agent_id?: string;
  user_message?: string;
  conversation_status?: string;
  timestamp?: string;
  user_id?: string;
  metadata?: any;
}

interface TrackingCodeResponse {
  success: boolean;
  tracking_data?: {
    trackingCode: string;
    conversationId: string;
    timestamp: string;
    status: string;
    triggerType: string;
    spokenText: string[];
  };
  error?: string;
}

export default async function handler(request: Request): Promise<Response> {
  // CORS headers for all responses
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Signature',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }

  try {
    console.log('🎯 ElevenLabs webhook received');
    
    // Parse the request body
    const payload: ElevenLabsWebhookPayload = await request.json();
    console.log('📨 Payload:', JSON.stringify(payload, null, 2));

    // Verify webhook signature if secret is provided
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET');
    if (webhookSecret) {
      const signature = request.headers.get('X-Signature');
      if (!signature || !verifyWebhookSignature(payload, signature, webhookSecret)) {
        console.error('❌ Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
          },
        });
      }
    }

    // Check if tracking code should be generated
    const shouldGenerateTracking = checkTrackingTriggers(payload);
    
    if (!shouldGenerateTracking) {
      console.log('ℹ️ No tracking triggers detected');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Event processed, no tracking code needed' 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    // Generate tracking code
    const trackingCode = generateTrackingCode();
    const conversationId = payload.conversation_id || `conv_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    console.log(`🔢 Generated tracking code: ${trackingCode}`);

    // Create spoken text variations for clear pronunciation
    const spokenText = formatTrackingCodeForSpeech(trackingCode);

    // Inject tracking code into ElevenLabs conversation
    const injectionResult = await injectTrackingCodeIntoConversation(
      conversationId,
      payload.agent_id || '',
      spokenText
    );

    // Store tracking data (optional - can integrate with your database)
    await storeTrackingData({
      trackingCode,
      conversationId,
      timestamp,
      triggerType: determineTriggerType(payload),
      payload,
    });

    const response: TrackingCodeResponse = {
      success: true,
      tracking_data: {
        trackingCode,
        conversationId,
        timestamp,
        status: injectionResult.success ? 'injected' : 'generated',
        triggerType: determineTriggerType(payload),
        spokenText,
      },
    };

    console.log('✅ Tracking code generated and processed successfully');

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
}

/**
 * Generate a 10-digit tracking code in format YYMMDDXXXX
 */
function generateTrackingCode(): string {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${year}${month}${day}${random}`;
}

/**
 * Check if the webhook payload should trigger tracking code generation
 */
function checkTrackingTriggers(payload: ElevenLabsWebhookPayload): boolean {
  const { event_type, user_message, conversation_status } = payload;

  // Manual tracking request
  if (event_type === 'manual_tracking_request') {
    return true;
  }

  // Conversation completion
  if (event_type === 'conversation.ended' || 
      event_type === 'conversation.completed' ||
      conversation_status === 'completed') {
    return true;
  }

  // User message contains tracking keywords
  if (user_message && event_type === 'conversation.user_message') {
    const message = user_message.toLowerCase();
    
    const trackingKeywords = [
      'tracking code', 'tracking number',
      'confirmation code', 'confirmation number',
      'receipt', 'receipt number',
      'reference number', 'order number',
      'case number', 'ticket number',
      'can i get', 'please provide', 'i need', 'give me'
    ];

    const completionKeywords = [
      'completed', 'finished', 'done',
      'successful', 'approved', 'confirmed'
    ];

    return trackingKeywords.some(keyword => message.includes(keyword)) ||
           completionKeywords.some(keyword => message.includes(keyword));
  }

  // Conversation start (optional - can be enabled)
  if (event_type === 'conversation.started') {
    // Uncomment to generate tracking codes at conversation start
    // return true;
  }

  return false;
}

/**
 * Determine the trigger type for logging
 */
function determineTriggerType(payload: ElevenLabsWebhookPayload): string {
  if (payload.event_type === 'manual_tracking_request') return 'manual';
  if (payload.event_type === 'conversation.ended') return 'conversation_end';
  if (payload.user_message) return 'keyword';
  return 'automatic';
}

/**
 * Format tracking code for clear speech synthesis
 */
function formatTrackingCodeForSpeech(trackingCode: string): string[] {
  const digits = trackingCode.split('');
  
  return [
    // Clear announcement with full number
    `Your tracking code is: ${digits.join(', ')}. Please write this down.`,
    
    // Grouped format for easier memorization (date + random)
    `I'll repeat that in groups: ${digits.slice(0, 6).join('')}, ${digits.slice(6).join('')}.`,
    
    // Slow digit-by-digit spelling
    `Let me spell that out slowly: ${digits.map(d => `${d}`).join(' pause ')}.`,
    
    // Final confirmation
    `To confirm, your tracking code is ${trackingCode}. Please keep this for your records.`
  ];
}

/**
 * Inject tracking code into ElevenLabs conversation
 */
async function injectTrackingCodeIntoConversation(
  conversationId: string,
  agentId: string,
  spokenText: string[]
): Promise<{ success: boolean; error?: string }> {
  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  
  if (!apiKey) {
    console.warn('⚠️ No ElevenLabs API key provided - skipping injection');
    return { success: false, error: 'No API key configured' };
  }

  try {
    console.log(`📤 Injecting tracking code into conversation: ${conversationId}`);
    
    // For each spoken text variation, inject into the conversation
    for (let i = 0; i < spokenText.length; i++) {
      const text = spokenText[i];
      
      // Add delay between messages (except for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/agent_say`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_settings: {
            stability: 0.9,
            similarity_boost: 0.8,
            style: 0.0, // Very neutral for numbers
            use_speaker_boost: true
          }
        }),
      });

      if (!response.ok) {
        console.error(`❌ Failed to inject message ${i + 1}: ${response.status} ${response.statusText}`);
      } else {
        console.log(`✅ Successfully injected message ${i + 1}/${spokenText.length}`);
      }
    }

    return { success: true };

  } catch (error) {
    console.error('❌ Error injecting tracking code:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Store tracking data for audit and retrieval
 */
async function storeTrackingData(data: {
  trackingCode: string;
  conversationId: string;
  timestamp: string;
  triggerType: string;
  payload: any;
}): Promise<void> {
  try {
    console.log(`📝 Storing tracking data: ${data.trackingCode}`);
    
    // You can integrate with your database here
    // For now, we'll just log the data
    console.log('Tracking data:', JSON.stringify(data, null, 2));
    
    // Example: Store in Supabase (if you want to keep database integration)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (supabaseUrl && supabaseKey) {
      const response = await fetch(`${supabaseUrl}/rest/v1/tracking_codes`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          tracking_code: data.trackingCode,
          conversation_id: data.conversationId,
          trigger_type: data.triggerType,
          created_at: data.timestamp,
          metadata: data.payload
        })
      });

      if (response.ok) {
        console.log('✅ Tracking data stored in database');
      } else {
        console.warn('⚠️ Failed to store in database, but continuing...');
      }
    }

  } catch (error) {
    console.error('❌ Error storing tracking data:', error);
    // Don't throw here - we don't want storage failures to break the main flow
  }
}

/**
 * Verify webhook signature for security
 */
function verifyWebhookSignature(
  payload: any,
  signature: string,
  secret: string
): boolean {
  try {
    // Implement signature verification based on ElevenLabs webhook format
    // This is a simplified version - adjust based on actual ElevenLabs signature format
    const expectedSignature = `sha256=${btoa(JSON.stringify(payload) + secret)}`;
    return signature === expectedSignature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}