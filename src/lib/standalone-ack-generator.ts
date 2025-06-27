/**
 * Standalone ElevenLabs ACK Generation System
 * Direct integration with ElevenLabs API without N8N dependency
 */

interface StandaloneACKConfig {
  apiKey: string;
  agentId: string;
  voiceId?: string;
  enableTimeBasedACK?: boolean;
  timeIntervalMinutes?: number;
  customKeywords?: string[];
  webhookSecret?: string;
}

interface ACKGenerationResult {
  ackNumber: string;
  conversationId: string;
  timestamp: string;
  status: 'generated' | 'injected' | 'failed';
  triggerType: 'keyword' | 'time' | 'manual' | 'conversation_end';
  spokenText: string[];
  injectionResults?: Array<{
    messageIndex: number;
    success: boolean;
    timestamp: string;
    error?: string;
  }>;
}

interface ConversationState {
  conversationId: string;
  userId?: string;
  agentId: string;
  startTime: Date;
  lastActivity: Date;
  lastACKTime?: Date;
  ackCount: number;
  isActive: boolean;
  metadata: any;
}

export class StandaloneACKGenerator {
  private config: StandaloneACKConfig;
  private baseUrl = 'https://api.elevenlabs.io/v1';
  private conversations = new Map<string, ConversationState>();
  private timeBasedInterval?: NodeJS.Timeout;

  constructor(config: StandaloneACKConfig) {
    this.config = {
      voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default voice
      enableTimeBasedACK: true,
      timeIntervalMinutes: 5,
      customKeywords: ['backfeed', 'employee feedback', 'confirmation code', 'reference number'],
      ...config
    };

    if (this.config.enableTimeBasedACK) {
      this.startTimeBasedMonitoring();
    }
  }

  /**
   * Generate a unique 10-digit ACK number
   */
  generateACKNumber(): string {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    return timestamp + random;
  }

  /**
   * Format ACK number for clear speech
   */
  formatACKForSpeech(ackNumber: string): string[] {
    const digits = ackNumber.split('');
    const groupedDigits = [
      digits.slice(0, 3).join(''),
      digits.slice(3, 6).join(''),
      digits.slice(6, 10).join('')
    ];
    
    return [
      `Your confirmation number is: ${digits.join(', ')}. Please write this down for your records.`,
      `I'll repeat that in groups: ${groupedDigits[0]}, ${groupedDigits[1]}, ${groupedDigits[2]}.`,
      `Let me spell that out slowly: ${digits.map(d => `${d}`).join(' pause ')}.`,
      `To confirm, your acknowledgment number is ${ackNumber}. Please keep this safe.`
    ];
  }

  /**
   * Process conversation message and check for ACK triggers
   */
  async processConversationMessage(
    conversationId: string,
    userMessage: string,
    agentId: string,
    userId?: string
  ): Promise<ACKGenerationResult | null> {
    // Update conversation state
    this.updateConversationState(conversationId, agentId, userId);

    // Check for keyword triggers
    const keywordTriggered = this.checkKeywordTriggers(userMessage);
    
    if (keywordTriggered) {
      return await this.generateAndInjectACK(conversationId, 'keyword', {
        userMessage,
        triggeredKeywords: keywordTriggered
      });
    }

    return null;
  }

  /**
   * Handle conversation end and generate ACK if needed
   */
  async handleConversationEnd(
    conversationId: string,
    conversationData: any
  ): Promise<ACKGenerationResult | null> {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      console.warn(`Conversation ${conversationId} not found in state`);
      return null;
    }

    // Mark conversation as inactive
    conversation.isActive = false;
    conversation.lastActivity = new Date();

    // Generate ACK for conversation completion
    return await this.generateAndInjectACK(conversationId, 'conversation_end', {
      conversationData,
      duration: Date.now() - conversation.startTime.getTime()
    });
  }

  /**
   * Manually trigger ACK generation
   */
  async generateManualACK(
    conversationId: string,
    userId?: string
  ): Promise<ACKGenerationResult> {
    return await this.generateAndInjectACK(conversationId, 'manual', {
      userId,
      manualTrigger: true
    });
  }

  /**
   * Core ACK generation and injection logic
   */
  private async generateAndInjectACK(
    conversationId: string,
    triggerType: ACKGenerationResult['triggerType'],
    metadata: any = {}
  ): Promise<ACKGenerationResult> {
    const timestamp = new Date().toISOString();
    
    try {
      console.log(`🎯 Generating ACK for conversation ${conversationId}, trigger: ${triggerType}`);
      
      // Generate ACK number
      const ackNumber = this.generateACKNumber();
      const spokenText = this.formatACKForSpeech(ackNumber);
      
      // Update conversation ACK count
      const conversation = this.conversations.get(conversationId);
      if (conversation) {
        conversation.ackCount++;
        conversation.lastACKTime = new Date();
      }

      // For demo purposes, simulate the injection process
      // In production, this would use actual ElevenLabs API calls
      const injectionResults = await this.simulateACKInjection(conversationId, spokenText);
      
      // Log the ACK generation
      await this.logACKGeneration({
        ackNumber,
        conversationId,
        triggerType,
        timestamp,
        metadata,
        injectionResults
      });

      // Store in database
      await this.storeACKInDatabase({
        ackNumber,
        conversationId,
        triggerType,
        timestamp,
        spokenText,
        injectionResults
      });

      const result: ACKGenerationResult = {
        ackNumber,
        conversationId,
        timestamp,
        status: injectionResults.every(r => r.success) ? 'injected' : 'failed',
        triggerType,
        spokenText,
        injectionResults
      };

      console.log(`✅ ACK generation completed: ${ackNumber}`);
      return result;

    } catch (error) {
      console.error(`❌ ACK generation failed for ${conversationId}:`, error);
      
      return {
        ackNumber: '',
        conversationId,
        timestamp,
        status: 'failed',
        triggerType,
        spokenText: [],
        injectionResults: [{
          messageIndex: 0,
          success: false,
          timestamp,
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      };
    }
  }

  /**
   * Simulate ACK injection (replace with actual ElevenLabs API calls in production)
   */
  private async simulateACKInjection(
    conversationId: string,
    spokenText: string[]
  ): Promise<Array<{ messageIndex: number; success: boolean; timestamp: string; error?: string }>> {
    const results = [];
    
    for (let i = 0; i < spokenText.length; i++) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      results.push({
        messageIndex: i,
        success,
        timestamp: new Date().toISOString(),
        error: success ? undefined : 'Simulated injection failure'
      });
    }
    
    return results;
  }

  /**
   * Check if user message contains ACK trigger keywords
   */
  private checkKeywordTriggers(message: string): string[] | null {
    const lowerMessage = message.toLowerCase();
    const triggeredKeywords: string[] = [];
    
    // Default ACK keywords
    const defaultKeywords = [
      'confirmation', 'confirmation number', 'confirmation code',
      'reference', 'reference number', 'reference code',
      'receipt', 'receipt number',
      'acknowledgment', 'acknowledgment number',
      'ticket', 'ticket number',
      'case number', 'case id'
    ];
    
    // Combine with custom keywords
    const allKeywords = [...defaultKeywords, ...(this.config.customKeywords || [])];
    
    for (const keyword of allKeywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        triggeredKeywords.push(keyword);
      }
    }
    
    return triggeredKeywords.length > 0 ? triggeredKeywords : null;
  }

  /**
   * Update conversation state
   */
  private updateConversationState(
    conversationId: string,
    agentId: string,
    userId?: string
  ): void {
    const existing = this.conversations.get(conversationId);
    
    if (existing) {
      existing.lastActivity = new Date();
      existing.isActive = true;
    } else {
      this.conversations.set(conversationId, {
        conversationId,
        userId,
        agentId,
        startTime: new Date(),
        lastActivity: new Date(),
        ackCount: 0,
        isActive: true,
        metadata: {}
      });
    }
  }

  /**
   * Start time-based ACK monitoring
   */
  private startTimeBasedMonitoring(): void {
    const intervalMs = (this.config.timeIntervalMinutes || 5) * 60 * 1000;
    
    this.timeBasedInterval = setInterval(() => {
      this.checkTimeBasedTriggers();
    }, intervalMs);
    
    console.log(`⏰ Time-based ACK monitoring started (${this.config.timeIntervalMinutes} min intervals)`);
  }

  /**
   * Check for time-based ACK triggers
   */
  private async checkTimeBasedTriggers(): Promise<void> {
    const now = new Date();
    const intervalMs = (this.config.timeIntervalMinutes || 5) * 60 * 1000;
    
    for (const [conversationId, conversation] of this.conversations) {
      if (!conversation.isActive) continue;
      
      // Check if enough time has passed since last ACK
      const timeSinceLastACK = conversation.lastACKTime 
        ? now.getTime() - conversation.lastACKTime.getTime()
        : now.getTime() - conversation.startTime.getTime();
      
      if (timeSinceLastACK >= intervalMs) {
        console.log(`⏰ Time-based ACK trigger for conversation ${conversationId}`);
        
        try {
          await this.generateAndInjectACK(conversationId, 'time', {
            timeSinceLastACK,
            intervalMs,
            conversationDuration: now.getTime() - conversation.startTime.getTime()
          });
        } catch (error) {
          console.error(`❌ Time-based ACK failed for ${conversationId}:`, error);
        }
      }
    }
  }

  /**
   * Log ACK generation event
   */
  private async logACKGeneration(logData: any): Promise<void> {
    try {
      console.log('📝 Logging ACK generation:', {
        ackNumber: logData.ackNumber,
        conversationId: logData.conversationId,
        triggerType: logData.triggerType,
        timestamp: logData.timestamp
      });

      // Import dbService dynamically to avoid circular dependencies
      const { dbService } = await import('./supabase');
      
      // Create a case for the ACK generation
      const caseData = await dbService.createCase({
        confirmationCode: logData.ackNumber,
        category: 'ACK Generation',
        summary: `Acknowledgment number generated for conversation. Trigger: ${logData.triggerType}. Conversation ID: ${logData.conversationId}`,
        severity: 1
      });

      // Add system interaction
      const successCount = logData.injectionResults?.filter((r: any) => r.success).length || 0;
      const totalCount = logData.injectionResults?.length || 0;
      
      const interactionMessage = `✅ ACK number ${logData.ackNumber} generated and processed for conversation ${logData.conversationId}.

Trigger Type: ${logData.triggerType}
Generation Time: ${logData.timestamp}
Injection Success Rate: ${successCount}/${totalCount} messages
Status: ${successCount === totalCount ? 'Fully Successful' : successCount > 0 ? 'Partially Successful' : 'Failed'}

This acknowledgment number was generated through the standalone ElevenLabs ACK system and is ready for customer reference.`;

      await dbService.addInteraction(caseData.id, interactionMessage, 'system');

      // Add AI insight for tracking
      await dbService.addAIInsight(
        caseData.id,
        'elevenlabs_realtime',
        {
          ack_number: logData.ackNumber,
          conversation_id: logData.conversationId,
          trigger_type: logData.triggerType,
          generation_timestamp: logData.timestamp,
          processing_type: 'standalone_ack_generation',
          voice_injection: true,
          injection_results: logData.injectionResults,
          success_rate: totalCount > 0 ? successCount / totalCount : 0,
          metadata: logData.metadata
        },
        successCount === totalCount ? 1.0 : successCount > 0 ? 0.7 : 0.0
      );

    } catch (error) {
      console.error('❌ Failed to log ACK generation:', error);
    }
  }

  /**
   * Store ACK in database for tracking
   */
  private async storeACKInDatabase(ackData: any): Promise<void> {
    try {
      const { dbService } = await import('./supabase');
      
      // Find the case by confirmation code
      const caseData = await dbService.getCaseByCode(ackData.ackNumber);
      
      if (caseData) {
        // Add transcript of the ACK generation
        const transcriptText = `ACK Number Generation and Injection Report

ACK Number: ${ackData.ackNumber}
Conversation ID: ${ackData.conversationId}
Trigger Type: ${ackData.triggerType}
Generation Time: ${ackData.timestamp}

Spoken Messages:
${ackData.spokenText.map((text: string, index: number) => `${index + 1}. ${text}`).join('\n')}

Injection Results:
${ackData.injectionResults?.map((result: any, index: number) => 
  `Message ${index + 1}: ${result.success ? '✅ Success' : '❌ Failed'} at ${result.timestamp}${result.error ? ` (${result.error})` : ''}`
).join('\n') || 'No injection results available'}`;

        await dbService.addTranscript(
          caseData.id,
          transcriptText,
          `ACK number ${ackData.ackNumber} generated via standalone ElevenLabs system`,
          0.0 // Neutral sentiment for system-generated content
        );
      }

    } catch (error) {
      console.error('❌ Failed to store ACK in database:', error);
    }
  }

  /**
   * Get conversation statistics
   */
  getStats(): {
    totalConversations: number;
    activeConversations: number;
    totalACKsGenerated: number;
    averageACKsPerConversation: number;
  } {
    const totalConversations = this.conversations.size;
    const activeConversations = Array.from(this.conversations.values()).filter(c => c.isActive).length;
    const totalACKsGenerated = Array.from(this.conversations.values()).reduce((sum, c) => sum + c.ackCount, 0);
    const averageACKsPerConversation = totalConversations > 0 ? totalACKsGenerated / totalConversations : 0;

    return {
      totalConversations,
      activeConversations,
      totalACKsGenerated,
      averageACKsPerConversation: Math.round(averageACKsPerConversation * 100) / 100
    };
  }

  /**
   * Cleanup inactive conversations
   */
  cleanupInactiveConversations(maxAgeMinutes: number = 60): void {
    const cutoffTime = new Date(Date.now() - maxAgeMinutes * 60 * 1000);
    let cleanedCount = 0;

    for (const [conversationId, conversation] of this.conversations) {
      if (!conversation.isActive && conversation.lastActivity < cutoffTime) {
        this.conversations.delete(conversationId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} inactive conversations`);
    }
  }

  /**
   * Stop the ACK generator and cleanup
   */
  stop(): void {
    if (this.timeBasedInterval) {
      clearInterval(this.timeBasedInterval);
      this.timeBasedInterval = undefined;
    }
    
    this.conversations.clear();
    console.log('🛑 Standalone ACK generator stopped');
  }
}

/**
 * Webhook handler for ElevenLabs conversation events
 */
export class StandaloneACKWebhookHandler {
  private ackGenerator: StandaloneACKGenerator;

  constructor(config: StandaloneACKConfig) {
    this.ackGenerator = new StandaloneACKGenerator(config);
  }

  /**
   * Handle ElevenLabs conversation webhook
   */
  async handleConversationWebhook(payload: any): Promise<{
    success: boolean;
    ackGenerated?: boolean;
    ackNumber?: string;
    error?: string;
  }> {
    try {
      console.log('📨 Processing ElevenLabs conversation webhook:', payload.event_type);

      const conversationId = payload.conversation_id || payload.conversationId || 'unknown';
      const agentId = payload.agent_id || payload.agentId || this.ackGenerator['config'].agentId;

      switch (payload.event_type) {
        case 'conversation.started':
          // Initialize conversation tracking
          this.ackGenerator['updateConversationState'](conversationId, agentId, payload.user_id);
          return { success: true, ackGenerated: false };

        case 'conversation.user_message':
          // Check for ACK triggers in user message
          const userMessage = payload.user_message || payload.message || '';
          const ackResult = await this.ackGenerator.processConversationMessage(
            conversationId,
            userMessage,
            agentId,
            payload.user_id
          );

          return {
            success: true,
            ackGenerated: ackResult !== null,
            ackNumber: ackResult?.ackNumber
          };

        case 'conversation.ended':
        case 'conversation.completed':
          // Generate ACK for conversation completion
          const endResult = await this.ackGenerator.handleConversationEnd(conversationId, payload);
          
          return {
            success: true,
            ackGenerated: endResult !== null,
            ackNumber: endResult?.ackNumber
          };

        default:
          console.log(`ℹ️ Unhandled event type: ${payload.event_type}`);
          return { success: true, ackGenerated: false };
      }

    } catch (error) {
      console.error('❌ Webhook handling failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle manual ACK generation request
   */
  async handleManualACKRequest(payload: {
    conversationId: string;
    userId?: string;
  }): Promise<ACKGenerationResult> {
    return await this.ackGenerator.generateManualACK(payload.conversationId, payload.userId);
  }

  /**
   * Get system statistics
   */
  getStats() {
    return this.ackGenerator.getStats();
  }

  /**
   * Stop the webhook handler
   */
  stop(): void {
    this.ackGenerator.stop();
  }
}

/**
 * Factory function to create standalone ACK generator
 */
export const createStandaloneACKGenerator = (config: StandaloneACKConfig): StandaloneACKGenerator => {
  if (!config.apiKey || !config.agentId) {
    throw new Error('Missing required configuration: apiKey and agentId are required');
  }
  
  return new StandaloneACKGenerator(config);
};

/**
 * Factory function to create webhook handler
 */
export const createStandaloneACKWebhookHandler = (config: StandaloneACKConfig): StandaloneACKWebhookHandler => {
  if (!config.apiKey || !config.agentId) {
    throw new Error('Missing required configuration: apiKey and agentId are required');
  }
  
  return new StandaloneACKWebhookHandler(config);
};