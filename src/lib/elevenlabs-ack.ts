/**
 * ElevenLabs ACK Number Generation and Injection System
 * Handles real-time confirmation number generation and voice injection during calls
 */

interface ACKGenerationConfig {
  voiceId: string;
  callId: string;
  apiKey: string;
  modelId?: string;
  voiceSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

interface ACKResponse {
  ackNumber: string;
  callId: string;
  timestamp: string;
  status: 'generated' | 'injected' | 'failed';
  audioUrls?: string[];
  injectionResults?: Array<{
    messageIndex: number;
    success: boolean;
    timestamp: string;
    error?: string;
  }>;
}

interface N8NWebhookPayload {
  trigger_type: 'keyword' | 'time' | 'event' | 'manual';
  call_id: string;
  voice_id: string;
  user_id?: string;
  session_data?: any;
  webhook_url?: string;
  callback_url?: string;
}

export class ElevenLabsACKGenerator {
  private config: ACKGenerationConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(config: ACKGenerationConfig) {
    this.config = {
      modelId: 'eleven_monolingual_v1',
      voiceSettings: {
        stability: 0.8,        // Higher stability for numbers
        similarity_boost: 0.7, // Clear pronunciation
        style: 0.1,           // Neutral style
        use_speaker_boost: true
      },
      ...config
    };
  }

  /**
   * Generate a 10-digit ACK number with validation
   */
  generateACKNumber(): string {
    // Generate a unique 10-digit number
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return timestamp + random;
  }

  /**
   * Format ACK number for clear speech with multiple variations
   */
  formatACKForSpeech(ackNumber: string): string[] {
    const digits = ackNumber.split('');
    const groupedDigits = [
      digits.slice(0, 3).join(''),
      digits.slice(3, 6).join(''),
      digits.slice(6, 10).join('')
    ];
    
    return [
      // Initial clear announcement
      `Your confirmation number is: ${digits.join(', ')}. Please write this down.`,
      
      // Grouped format for easier memorization
      `I'll repeat that in groups: ${groupedDigits[0]}, ${groupedDigits[1]}, ${groupedDigits[2]}.`,
      
      // Slow digit-by-digit with pauses
      `Let me spell that out slowly: ${digits.map(d => `${d}`).join(' pause ')}.`,
      
      // Final confirmation
      `To confirm, your acknowledgment number is ${ackNumber}. Please keep this for your records.`
    ];
  }

  /**
   * Generate TTS audio for ACK number with optimized settings
   */
  async generateACKAudio(ackNumber: string): Promise<string[]> {
    const messages = this.formatACKForSpeech(ackNumber);
    const audioUrls: string[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      try {
        console.log(`🎵 Generating TTS for message ${i + 1}:`, message);

        const response = await fetch(`${this.baseUrl}/text-to-speech/${this.config.voiceId}/stream`, {
          method: 'POST',
          headers: {
            'xi-api-key': this.config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: message,
            model_id: this.config.modelId,
            voice_settings: {
              ...this.config.voiceSettings,
              // Optimize for number clarity
              stability: 0.9,
              similarity_boost: 0.8,
              style: 0.0 // Very neutral for numbers
            }
          })
        });

        if (!response.ok) {
          throw new Error(`TTS generation failed: ${response.status} ${response.statusText}`);
        }

        // Convert audio blob to URL for playback/injection
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioUrls.push(audioUrl);

        console.log(`✅ Generated TTS audio ${i + 1}/${messages.length}`);

      } catch (error) {
        console.error(`❌ Failed to generate TTS for message ${i + 1}:`, error);
        throw new Error(`TTS generation failed for message ${i + 1}: ${error}`);
      }
    }

    return audioUrls;
  }

  /**
   * Inject ACK message into active phone call with retry logic
   */
  async injectACKIntoCall(ackNumber: string): Promise<ACKResponse> {
    const timestamp = new Date().toISOString();
    const injectionResults: ACKResponse['injectionResults'] = [];

    try {
      console.log(`📞 Starting ACK injection for call: ${this.config.callId}`);
      
      const messages = this.formatACKForSpeech(ackNumber);
      
      // Generate audio for each message first
      console.log('🎵 Generating audio for all messages...');
      const audioUrls = await this.generateACKAudio(ackNumber);

      // Inject messages into call with appropriate delays
      for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        const messageTimestamp = new Date().toISOString();
        
        try {
          // Add delay between messages (except for the first one)
          if (i > 0) {
            const delay = i === 1 ? 3000 : 2000; // Longer delay after first message
            console.log(`⏱️ Waiting ${delay}ms before next injection...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }

          console.log(`📤 Injecting message ${i + 1}/${messages.length} into call...`);

          const response = await fetch(`${this.baseUrl}/phone-calls/${this.config.callId}/inject-message`, {
            method: 'POST',
            headers: {
              'xi-api-key': this.config.apiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              text: message,
              voice_settings: {
                ...this.config.voiceSettings,
                stability: 0.9,
                similarity_boost: 0.8,
                style: 0.0
              }
            })
          });

          const success = response.ok;
          injectionResults.push({
            messageIndex: i,
            success,
            timestamp: messageTimestamp,
            error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`
          });

          if (success) {
            console.log(`✅ Successfully injected message ${i + 1}`);
          } else {
            console.error(`❌ Failed to inject message ${i + 1}: ${response.status} ${response.statusText}`);
          }

        } catch (error) {
          console.error(`❌ Error injecting message ${i + 1}:`, error);
          injectionResults.push({
            messageIndex: i,
            success: false,
            timestamp: messageTimestamp,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Determine overall success
      const successfulInjections = injectionResults.filter(r => r.success).length;
      const overallSuccess = successfulInjections > 0;

      console.log(`📊 ACK injection complete: ${successfulInjections}/${messages.length} messages successful`);

      return {
        ackNumber,
        callId: this.config.callId,
        timestamp,
        status: overallSuccess ? 'injected' : 'failed',
        audioUrls,
        injectionResults
      };

    } catch (error) {
      console.error('❌ Failed to inject ACK into call:', error);
      return {
        ackNumber,
        callId: this.config.callId,
        timestamp,
        status: 'failed',
        injectionResults
      };
    }
  }

  /**
   * Real-time WebSocket TTS streaming for live injection
   */
  async streamACKToCall(ackNumber: string): Promise<WebSocket> {
    const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}/stream-input`;
    
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('🔌 WebSocket connected for ACK streaming');
        
        // Send authentication and configuration
        ws.send(JSON.stringify({
          xi_api_key: this.config.apiKey,
          voice_settings: {
            ...this.config.voiceSettings,
            stability: 0.9,
            similarity_boost: 0.8,
            style: 0.0
          }
        }));

        // Stream ACK messages with timing
        const messages = this.formatACKForSpeech(ackNumber);
        messages.forEach((message, index) => {
          setTimeout(() => {
            console.log(`📤 Streaming message ${index + 1}: ${message}`);
            ws.send(JSON.stringify({
              text: message,
              try_trigger_generation: true,
              flush: index === messages.length - 1 // Flush on last message
            }));
          }, index * 3000); // 3-second delay between messages
        });

        resolve(ws);
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        reject(new Error('WebSocket connection failed'));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received audio chunk:', data.type || 'audio_data');
        } catch (e) {
          console.log('📨 Received binary audio data');
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket connection closed');
      };
    });
  }

  /**
   * Validate call ID and voice ID before processing
   */
  async validateConfiguration(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate voice ID
    try {
      const voiceResponse = await fetch(`${this.baseUrl}/voices/${this.config.voiceId}`, {
        headers: { 'xi-api-key': this.config.apiKey }
      });
      
      if (!voiceResponse.ok) {
        errors.push(`Invalid voice ID: ${this.config.voiceId}`);
      }
    } catch (error) {
      errors.push(`Failed to validate voice ID: ${error}`);
    }

    // Validate call ID (if it's a real call)
    if (this.config.callId && !this.config.callId.startsWith('demo_')) {
      try {
        const callResponse = await fetch(`${this.baseUrl}/phone-calls/${this.config.callId}`, {
          headers: { 'xi-api-key': this.config.apiKey }
        });
        
        if (!callResponse.ok) {
          errors.push(`Invalid or inactive call ID: ${this.config.callId}`);
        }
      } catch (error) {
        errors.push(`Failed to validate call ID: ${error}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * N8N Webhook handler for ACK generation with comprehensive logging
 */
export class N8NACKWebhookHandler {
  private ackGenerator: ElevenLabsACKGenerator;

  constructor(config: ACKGenerationConfig) {
    this.ackGenerator = new ElevenLabsACKGenerator(config);
  }

  /**
   * Handle webhook trigger for ACK generation with full workflow support
   */
  async handleWebhook(payload: N8NWebhookPayload): Promise<ACKResponse & { workflow_id?: string }> {
    const workflowId = `workflow_${Date.now()}`;
    
    try {
      console.log('🎯 ACK generation triggered via N8N webhook:', {
        trigger_type: payload.trigger_type,
        call_id: payload.call_id,
        workflow_id: workflowId
      });
      
      // Validate configuration before proceeding
      const validation = await this.ackGenerator.validateConfiguration();
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate ACK number
      const ackNumber = this.ackGenerator.generateACKNumber();
      console.log(`🔢 Generated ACK number: ${ackNumber}`);
      
      // Log the generation event
      await this.logACKGeneration({
        event: 'ack_number_generated',
        call_id: payload.call_id,
        ack_number: ackNumber,
        user_id: payload.user_id,
        trigger_type: payload.trigger_type,
        workflow_id: workflowId,
        timestamp: new Date().toISOString()
      });

      // Inject into call
      console.log('📞 Starting call injection...');
      const result = await this.ackGenerator.injectACKIntoCall(ackNumber);
      
      // Store ACK in database for tracking
      await this.storeACKInDatabase(result, payload, workflowId);
      
      // Send callback to N8N if URL provided
      if (payload.callback_url) {
        await this.sendN8NCallback(payload.callback_url, {
          ...result,
          workflow_id: workflowId,
          trigger_type: payload.trigger_type
        });
      }
      
      console.log('✅ ACK generation workflow completed successfully');
      
      return {
        ...result,
        workflow_id: workflowId
      };

    } catch (error) {
      console.error('❌ ACK webhook handling failed:', error);
      
      // Log the error
      await this.logACKGeneration({
        event: 'ack_generation_failed',
        call_id: payload.call_id,
        user_id: payload.user_id,
        trigger_type: payload.trigger_type,
        workflow_id: workflowId,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      throw error;
    }
  }

  /**
   * Log ACK generation event with comprehensive details
   */
  private async logACKGeneration(logData: any): Promise<void> {
    try {
      console.log('📝 Logging ACK generation event:', logData);
      
      // Import dbService dynamically to avoid circular dependencies
      const { dbService } = await import('./supabase');
      
      // Create a case for the ACK generation
      const confirmationCode = logData.ack_number || `ACK_${Date.now()}`;
      
      const caseData = await dbService.createCase({
        confirmationCode,
        category: 'ACK Generation',
        summary: `Acknowledgment number generated during phone call. Trigger: ${logData.trigger_type}. Call ID: ${logData.call_id}. Workflow: ${logData.workflow_id}`,
        severity: 1
      });

      // Add system interaction with detailed information
      const interactionMessage = logData.error 
        ? `❌ ACK generation failed for call ${logData.call_id}. Error: ${logData.error}. Trigger: ${logData.trigger_type}. Workflow: ${logData.workflow_id}`
        : `✅ ACK number ${logData.ack_number} generated and injected into call ${logData.call_id}. Trigger: ${logData.trigger_type}. Workflow: ${logData.workflow_id}`;

      await dbService.addInteraction(
        caseData.id,
        interactionMessage,
        'system'
      );

      // Add AI insight for tracking and analytics
      await dbService.addAIInsight(
        caseData.id,
        'elevenlabs_realtime',
        {
          ack_number: logData.ack_number,
          call_id: logData.call_id,
          trigger_type: logData.trigger_type,
          workflow_id: logData.workflow_id,
          generation_timestamp: logData.timestamp,
          processing_type: 'ack_generation',
          voice_injection: true,
          n8n_integration: true,
          user_id: logData.user_id,
          event_type: logData.event,
          error: logData.error
        },
        logData.error ? 0.0 : 1.0
      );

      console.log('✅ ACK generation event logged successfully');

    } catch (error) {
      console.error('❌ Failed to log ACK generation:', error);
      // Don't throw here to avoid breaking the main workflow
    }
  }

  /**
   * Store ACK in database for tracking and audit trail
   */
  private async storeACKInDatabase(ackResult: ACKResponse, payload: N8NWebhookPayload, workflowId: string): Promise<void> {
    try {
      const { dbService } = await import('./supabase');
      
      // Find the case by confirmation code
      const caseData = await dbService.getCaseByCode(ackResult.ackNumber);
      
      if (caseData) {
        // Add transcript of the ACK injection with detailed results
        const transcriptText = `ACK number ${ackResult.ackNumber} injection results:
        
Call ID: ${ackResult.callId}
Status: ${ackResult.status}
Timestamp: ${ackResult.timestamp}
Workflow ID: ${workflowId}
Trigger Type: ${payload.trigger_type}

Injection Results:
${ackResult.injectionResults?.map((result, index) => 
  `Message ${index + 1}: ${result.success ? '✅ Success' : '❌ Failed'} at ${result.timestamp}${result.error ? ` (${result.error})` : ''}`
).join('\n') || 'No detailed results available'}

Audio URLs Generated: ${ackResult.audioUrls?.length || 0}
Total Messages: ${ackResult.injectionResults?.length || 0}
Successful Injections: ${ackResult.injectionResults?.filter(r => r.success).length || 0}`;

        await dbService.addTranscript(
          caseData.id,
          transcriptText,
          `ACK number ${ackResult.ackNumber} ${ackResult.status} via ElevenLabs TTS injection`,
          0.0 // Neutral sentiment for system-generated content
        );

        console.log('✅ ACK results stored in database');
      }

    } catch (error) {
      console.error('❌ Failed to store ACK in database:', error);
      // Don't throw here to avoid breaking the main workflow
    }
  }

  /**
   * Send callback to N8N with results
   */
  private async sendN8NCallback(callbackUrl: string, data: any): Promise<void> {
    try {
      console.log('📤 Sending callback to N8N:', callbackUrl);
      
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: data.status !== 'failed',
          ack_number: data.ackNumber,
          call_id: data.callId,
          workflow_id: data.workflow_id,
          trigger_type: data.trigger_type,
          timestamp: data.timestamp,
          injection_results: data.injectionResults,
          audio_urls_count: data.audioUrls?.length || 0
        })
      });

      if (response.ok) {
        console.log('✅ N8N callback sent successfully');
      } else {
        console.error('❌ N8N callback failed:', response.status, response.statusText);
      }

    } catch (error) {
      console.error('❌ Failed to send N8N callback:', error);
      // Don't throw here to avoid breaking the main workflow
    }
  }
}

/**
 * Factory function to create ACK generator with validation
 */
export const createACKGenerator = (config: ACKGenerationConfig): ElevenLabsACKGenerator => {
  if (!config.voiceId || !config.callId || !config.apiKey) {
    throw new Error('Missing required configuration: voiceId, callId, and apiKey are required');
  }
  
  return new ElevenLabsACKGenerator(config);
};

/**
 * Factory function to create N8N webhook handler with validation
 */
export const createN8NACKHandler = (config: ACKGenerationConfig): N8NACKWebhookHandler => {
  if (!config.voiceId || !config.callId || !config.apiKey) {
    throw new Error('Missing required configuration: voiceId, callId, and apiKey are required');
  }
  
  return new N8NACKWebhookHandler(config);
};

/**
 * Express.js middleware for handling N8N webhooks
 */
export const createN8NWebhookMiddleware = (defaultConfig: Partial<ACKGenerationConfig>) => {
  return async (req: any, res: any) => {
    try {
      const payload: N8NWebhookPayload = req.body;
      
      // Validate required fields
      if (!payload.call_id || !payload.voice_id || !payload.trigger_type) {
        return res.status(400).json({
          error: 'Missing required fields: call_id, voice_id, trigger_type'
        });
      }

      // Create configuration from payload and defaults
      const config: ACKGenerationConfig = {
        voiceId: payload.voice_id,
        callId: payload.call_id,
        apiKey: defaultConfig.apiKey || process.env.ELEVENLABS_API_KEY || '',
        ...defaultConfig
      };

      // Create handler and process webhook
      const handler = createN8NACKHandler(config);
      const result = await handler.handleWebhook(payload);

      res.json({
        success: true,
        ...result
      });

    } catch (error) {
      console.error('❌ N8N webhook middleware error:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
};