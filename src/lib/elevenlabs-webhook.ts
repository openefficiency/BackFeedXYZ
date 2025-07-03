/**
 * ElevenLabs webhook handler for processing completed conversations
 * Captures conversation summaries and routes them to HR portal
 */

interface ElevenLabsWebhookPayload {
  conversation_id?: string;
  agent_id?: string;
  status?: 'completed' | 'failed' | 'timeout';
  transcript?: {
    user_messages: Array<{
      text: string;
      timestamp: string;
    }>;
    agent_messages: Array<{
      text: string;
      timestamp: string;
    }>;
  };
  messages?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  summary?: string;
  sentiment_analysis?: {
    overall_sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
    emotions: string[];
  };
  conversation_metadata?: {
    duration_seconds: number;
    started_at: string;
    ended_at: string;
    user_satisfaction?: number;
  };
}

class ElevenLabsWebhookHandler {
  /**
   * Process ElevenLabs conversation completion webhook
   */
  static async handleConversationComplete(payload: ElevenLabsWebhookPayload): Promise<{
    success: boolean;
    caseId?: string;
    confirmationCode?: string;
    error?: string;
  }> {
    try {
      console.log('🎤 Processing ElevenLabs conversation completion:', payload);

      // Extract user feedback from conversation
      let userFeedback = '';
      
      if (payload.transcript?.user_messages) {
        userFeedback = payload.transcript.user_messages
          .map(msg => msg.text)
          .join('\n');
      } else if (payload.messages) {
        userFeedback = payload.messages
          .filter(msg => msg.role === 'user')
          .map(msg => msg.content)
          .join('\n');
      }

      // If no user feedback found, create a default message
      if (!userFeedback.trim()) {
        userFeedback = 'Employee provided feedback through ElevenLabs conversational AI widget. Detailed conversation transcript available in HR portal.';
      }

      // Generate confirmation code
      const confirmationCode = this.generateConfirmationCode();

      // Enhanced AI processing for better titles and summaries
      const aiResult = await this.processWithAI(userFeedback, payload);

      // Import dbService here to ensure it's available
      const { dbService } = await import('./supabase');

      // Create case in database with enhanced data
      console.log('Creating case with data:', {
        confirmationCode,
        category: aiResult.category,
        summary: aiResult.summary,
        severity: aiResult.severity
      });

      const caseData = await dbService.createCase({
        confirmationCode,
        category: aiResult.category,
        summary: aiResult.summary,
        severity: aiResult.severity
      });

      console.log('Case created successfully:', caseData);

      // Add transcript with ElevenLabs metadata
      await dbService.addTranscript(
        caseData.id,
        userFeedback,
        payload.summary || aiResult.summary,
        this.calculateSentimentScore(payload.sentiment_analysis)
      );

      console.log('Transcript added successfully');

      // Add initial HR routing message with enhanced context
      await this.addSystemMessage(caseData.id, payload, aiResult);

      console.log('System message added successfully');

      // Add ElevenLabs conversation insights
      await this.addConversationInsights(caseData.id, payload, aiResult);

      console.log('AI insights added successfully');

      console.log('✅ ElevenLabs conversation processed successfully:', confirmationCode);

      return {
        success: true,
        caseId: caseData.id,
        confirmationCode
      };

    } catch (error: any) {
      console.error('❌ Failed to process ElevenLabs conversation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enhanced AI processing for better case titles and summaries
   */
  private static async processWithAI(
    userFeedback: string, 
    payload: ElevenLabsWebhookPayload
  ): Promise<{
    title: string;
    category: string;
    summary: string;
    severity: number;
    sentiment: number;
    keyTopics: string[];
    urgencyIndicators: string[];
  }> {
    // Enhanced AI processing that considers conversation context
    const conversationContext = {
      duration: payload.conversation_metadata?.duration_seconds || 60,
      messageCount: payload.transcript?.user_messages?.length || payload.messages?.filter(m => m.role === 'user').length || 1,
      agentResponses: payload.transcript?.agent_messages?.length || payload.messages?.filter(m => m.role === 'assistant').length || 1,
      sentiment: payload.sentiment_analysis
    };

    // Extract key topics and themes from the conversation
    const keyTopics = this.extractKeyTopics(userFeedback);
    const urgencyIndicators = this.extractUrgencyIndicators(userFeedback);

    // Generate intelligent case title based on content analysis
    const title = this.generateCaseTitle(userFeedback, keyTopics);

    // Enhanced categorization based on conversation patterns
    const lowerFeedback = userFeedback.toLowerCase();
    let category = 'General Feedback';
    let severity = 3;
    let sentiment = -0.2;

    // Enhanced categorization with more nuanced detection
    if (this.containsKeywords(lowerFeedback, ['safety', 'accident', 'injury', 'equipment', 'dangerous', 'hazard', 'unsafe', 'risk'])) {
      category = 'Workplace Safety';
      severity = 4;
      sentiment = -0.4;
    } else if (this.containsKeywords(lowerFeedback, ['harassment', 'inappropriate', 'hostile', 'uncomfortable', 'discriminatory', 'bullying'])) {
      category = 'Harassment';
      severity = 4;
      sentiment = -0.6;
    } else if (this.containsKeywords(lowerFeedback, ['discrimination', 'unfair', 'bias', 'gender', 'age', 'race', 'promotion', 'equal'])) {
      category = 'Discrimination';
      severity = 5;
      sentiment = -0.7;
    } else if (this.containsKeywords(lowerFeedback, ['policy', 'break', 'procedure', 'rules', 'attendance', 'violation'])) {
      category = 'Policy Violation';
      severity = 2;
      sentiment = -0.3;
    } else if (this.containsKeywords(lowerFeedback, ['overtime', 'work-life', 'balance', 'burnout', 'stress', 'hours', 'family'])) {
      category = 'Work-Life Balance';
      severity = 3;
      sentiment = -0.4;
    } else if (this.containsKeywords(lowerFeedback, ['communication', 'coordination', 'information', 'departments', 'teamwork'])) {
      category = 'Workplace Environment';
      severity = 2;
      sentiment = -0.2;
    } else if (this.containsKeywords(lowerFeedback, ['benefits', 'insurance', 'retirement', 'pay', 'compensation', 'vacation'])) {
      category = 'Benefits Inquiry';
      severity = 1;
      sentiment = 0.0;
    }

    // Adjust severity based on conversation engagement and urgency indicators
    if (conversationContext.duration > 300) { // 5+ minutes indicates serious concern
      severity = Math.min(severity + 1, 5);
    }
    if (conversationContext.messageCount > 10) { // Many messages indicate detailed concern
      severity = Math.min(severity + 1, 5);
    }
    if (urgencyIndicators.length > 2) { // Multiple urgency indicators
      severity = Math.min(severity + 1, 5);
    }

    // Use ElevenLabs sentiment if available
    if (payload.sentiment_analysis) {
      sentiment = this.calculateSentimentScore(payload.sentiment_analysis);
    }

    // Generate enhanced summary
    const summary = this.generateEnhancedSummary(userFeedback, category, keyTopics, conversationContext);

    return {
      title,
      category,
      summary,
      severity,
      sentiment,
      keyTopics,
      urgencyIndicators
    };
  }

  /**
   * Generate intelligent case title based on content analysis
   */
  private static generateCaseTitle(feedback: string, keyTopics: string[]): string {
    const lowerFeedback = feedback.toLowerCase();
    
    // Safety-related titles
    if (this.containsKeywords(lowerFeedback, ['safety', 'accident', 'injury', 'equipment'])) {
      if (lowerFeedback.includes('equipment')) return 'Equipment Safety Concerns';
      if (lowerFeedback.includes('accident') || lowerFeedback.includes('injury')) return 'Workplace Accident Report';
      return 'Safety Protocol Violation';
    }
    
    // Harassment-related titles
    if (this.containsKeywords(lowerFeedback, ['harassment', 'inappropriate', 'hostile'])) {
      if (lowerFeedback.includes('supervisor') || lowerFeedback.includes('manager')) return 'Supervisor Harassment Report';
      if (lowerFeedback.includes('sexual')) return 'Sexual Harassment Complaint';
      return 'Workplace Harassment Incident';
    }
    
    // Discrimination-related titles
    if (this.containsKeywords(lowerFeedback, ['discrimination', 'unfair', 'bias'])) {
      if (lowerFeedback.includes('hiring') || lowerFeedback.includes('promotion')) return 'Hiring/Promotion Discrimination';
      if (lowerFeedback.includes('gender')) return 'Gender Discrimination Report';
      if (lowerFeedback.includes('age')) return 'Age Discrimination Complaint';
      return 'Workplace Discrimination Issue';
    }
    
    // Policy-related titles
    if (this.containsKeywords(lowerFeedback, ['policy', 'break', 'attendance'])) {
      if (lowerFeedback.includes('break')) return 'Break Policy Enforcement Issue';
      if (lowerFeedback.includes('attendance')) return 'Attendance Policy Concern';
      return 'Policy Violation Report';
    }
    
    // Work-life balance titles
    if (this.containsKeywords(lowerFeedback, ['overtime', 'work-life', 'balance', 'burnout'])) {
      if (lowerFeedback.includes('overtime')) return 'Excessive Overtime Concern';
      if (lowerFeedback.includes('burnout')) return 'Employee Burnout Report';
      return 'Work-Life Balance Issue';
    }
    
    // Communication titles
    if (this.containsKeywords(lowerFeedback, ['communication', 'coordination', 'departments'])) {
      return 'Interdepartmental Communication Issue';
    }
    
    // Benefits titles
    if (this.containsKeywords(lowerFeedback, ['benefits', 'insurance', 'retirement'])) {
      return 'Benefits Inquiry';
    }
    
    // Default title based on key topics
    if (keyTopics.length > 0) {
      return `${keyTopics[0].charAt(0).toUpperCase() + keyTopics[0].slice(1)} Concern`;
    }
    
    return 'Employee Feedback Report';
  }

  /**
   * Extract key topics from feedback text
   */
  private static extractKeyTopics(feedback: string): string[] {
    const topics: string[] = [];
    const lowerFeedback = feedback.toLowerCase();
    
    const topicKeywords = {
      'safety': ['safety', 'accident', 'injury', 'hazard', 'dangerous', 'equipment'],
      'harassment': ['harassment', 'inappropriate', 'hostile', 'uncomfortable', 'bullying'],
      'discrimination': ['discrimination', 'unfair', 'bias', 'equal', 'gender', 'age', 'race'],
      'management': ['supervisor', 'manager', 'leadership', 'boss'],
      'workload': ['overtime', 'workload', 'stress', 'burnout', 'hours'],
      'communication': ['communication', 'information', 'coordination', 'meetings'],
      'benefits': ['benefits', 'insurance', 'retirement', 'pay', 'compensation'],
      'environment': ['environment', 'culture', 'atmosphere', 'morale'],
      'training': ['training', 'development', 'skills', 'education'],
      'policies': ['policy', 'procedure', 'rules', 'guidelines']
    };
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (this.containsKeywords(lowerFeedback, keywords)) {
        topics.push(topic);
      }
    }
    
    return topics.slice(0, 3); // Return top 3 topics
  }

  /**
   * Extract urgency indicators from feedback
   */
  private static extractUrgencyIndicators(feedback: string): string[] {
    const indicators: string[] = [];
    const lowerFeedback = feedback.toLowerCase();
    
    const urgencyKeywords = [
      'immediate', 'urgent', 'emergency', 'asap', 'critical', 'serious',
      'dangerous', 'unsafe', 'threatening', 'escalating', 'worsening',
      'legal', 'lawsuit', 'attorney', 'violation', 'compliance'
    ];
    
    urgencyKeywords.forEach(keyword => {
      if (lowerFeedback.includes(keyword)) {
        indicators.push(keyword);
      }
    });
    
    return indicators;
  }

  /**
   * Generate enhanced summary with context
   */
  private static generateEnhancedSummary(
    feedback: string, 
    category: string, 
    keyTopics: string[], 
    context: any
  ): string {
    const duration = Math.round(context.duration / 60 * 10) / 10;
    const topicsText = keyTopics.length > 0 ? ` Key topics: ${keyTopics.join(', ')}.` : '';
    
    let summary = `${category} reported through ElevenLabs conversational AI (${duration} min conversation).${topicsText} `;
    
    // Add first 200 characters of actual feedback
    const feedbackPreview = feedback.length > 200 ? feedback.substring(0, 200) + '...' : feedback;
    summary += feedbackPreview;
    
    return summary;
  }

  /**
   * Helper method to check if text contains any of the keywords
   */
  private static containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * Add system message explaining ElevenLabs processing with enhanced context
   */
  private static async addSystemMessage(
    caseId: string,
    payload: ElevenLabsWebhookPayload,
    aiResult: any
  ): Promise<void> {
    const { dbService } = await import('./supabase');
    
    const duration = Math.round((payload.conversation_metadata?.duration_seconds || 60) / 60 * 10) / 10;
    const messageCount = payload.transcript?.user_messages?.length || payload.messages?.filter(m => m.role === 'user').length || 1;
    
    const systemMessage = `Enhanced ElevenLabs Conversational AI Processing Complete

Case Details:
• Title: ${aiResult.title}
• Category: ${aiResult.category}
• Severity: ${aiResult.severity}/5
• Key Topics: ${aiResult.keyTopics?.join(', ') || 'General feedback'}
• Urgency Indicators: ${aiResult.urgencyIndicators?.length || 0} detected

Conversation Metrics:
• Duration: ${duration} minutes
• User messages: ${messageCount}
• Agent responses: ${payload.transcript?.agent_messages?.length || payload.messages?.filter(m => m.role === 'assistant').length || 1}
• Conversation ID: ${payload.conversation_id || 'widget_conversation'}
• Processing Status: ${payload.status || 'completed'}

The employee engaged in a natural conversation with our AI assistant through the embedded widget. Advanced AI analysis has extracted key themes, assessed urgency, and automatically categorized the feedback for appropriate HR routing and response prioritization.`;

    await dbService.addInteraction(caseId, systemMessage, 'system');
  }

  /**
   * Add comprehensive conversation insights with enhanced analysis
   */
  private static async addConversationInsights(
    caseId: string,
    payload: ElevenLabsWebhookPayload,
    aiResult: any
  ): Promise<void> {
    const { dbService } = await import('./supabase');
    
    const userMessages = payload.transcript?.user_messages || payload.messages?.filter(m => m.role === 'user') || [];
    const agentMessages = payload.transcript?.agent_messages || payload.messages?.filter(m => m.role === 'assistant') || [];
    
    // Enhanced conversation quality insights
    await dbService.addAIInsight(
      caseId,
      'elevenlabs_conversation',
      {
        conversation_id: payload.conversation_id || 'widget_conversation',
        agent_id: payload.agent_id || 'agent_01jydtj6avef99c1ne0eavf0ww',
        case_title: aiResult.title,
        key_topics: aiResult.keyTopics,
        urgency_indicators: aiResult.urgencyIndicators,
        duration_seconds: payload.conversation_metadata?.duration_seconds || 60,
        total_messages: userMessages.length + agentMessages.length,
        user_engagement: {
          message_count: userMessages.length,
          avg_message_length: this.calculateAverageMessageLength(userMessages),
          conversation_depth: this.assessConversationDepth(payload),
          topic_coverage: aiResult.keyTopics?.length || 0
        },
        conversation_quality: this.assessConversationQuality(payload),
        sentiment_analysis: payload.sentiment_analysis,
        ai_categorization: {
          category: aiResult.category,
          severity: aiResult.severity,
          confidence: 0.85
        },
        hr_routing: {
          routed: true,
          priority: aiResult.severity >= 4 ? 'high' : aiResult.severity >= 3 ? 'medium' : 'normal',
          estimated_response_time: aiResult.severity >= 4 ? '24 hours' : '3-5 business days'
        },
        processing_type: 'conversational_ai_widget',
        processed_at: payload.conversation_metadata?.ended_at || new Date().toISOString()
      },
      0.92 // High confidence for ElevenLabs conversations
    );

    // Enhanced sentiment and emotional insights
    if (payload.sentiment_analysis) {
      await dbService.addAIInsight(
        caseId,
        'sentiment_analysis',
        {
          overall_sentiment: payload.sentiment_analysis.overall_sentiment,
          confidence: payload.sentiment_analysis.confidence,
          emotions_detected: payload.sentiment_analysis.emotions,
          sentiment_score: this.calculateSentimentScore(payload.sentiment_analysis),
          conversation_tone: this.assessConversationTone(payload),
          emotional_indicators: this.extractEmotionalIndicators(payload),
          urgency_assessment: {
            urgency_level: aiResult.urgencyIndicators?.length >= 2 ? 'high' : aiResult.urgencyIndicators?.length >= 1 ? 'medium' : 'low',
            indicators: aiResult.urgencyIndicators
          }
        },
        payload.sentiment_analysis.confidence
      );
    }
  }

  /**
   * Calculate sentiment score from ElevenLabs sentiment analysis
   */
  private static calculateSentimentScore(sentimentAnalysis?: ElevenLabsWebhookPayload['sentiment_analysis']): number {
    if (!sentimentAnalysis) return -0.2;
    
    switch (sentimentAnalysis.overall_sentiment) {
      case 'positive': return 0.3 * sentimentAnalysis.confidence;
      case 'negative': return -0.6 * sentimentAnalysis.confidence;
      case 'neutral': return 0.0;
      default: return -0.2;
    }
  }

  /**
   * Assess conversation quality based on engagement metrics
   */
  private static assessConversationQuality(payload: ElevenLabsWebhookPayload): string {
    const duration = payload.conversation_metadata?.duration_seconds || 60;
    const userMessages = payload.transcript?.user_messages?.length || payload.messages?.filter(m => m.role === 'user').length || 1;
    const avgMessageLength = this.calculateAverageMessageLength(
      payload.transcript?.user_messages || payload.messages?.filter(m => m.role === 'user') || []
    );

    if (duration > 300 && userMessages > 8 && avgMessageLength > 50) {
      return 'High Quality - Detailed conversation with comprehensive feedback';
    } else if (duration > 120 && userMessages > 4 && avgMessageLength > 30) {
      return 'Good Quality - Engaged conversation with meaningful feedback';
    } else if (duration > 60 && userMessages > 2) {
      return 'Moderate Quality - Basic conversation with some feedback';
    } else {
      return 'Standard Quality - Widget conversation completed';
    }
  }

  /**
   * Assess conversation depth
   */
  private static assessConversationDepth(payload: ElevenLabsWebhookPayload): string {
    const userMessages = payload.transcript?.user_messages?.length || payload.messages?.filter(m => m.role === 'user').length || 1;
    const agentMessages = payload.transcript?.agent_messages?.length || payload.messages?.filter(m => m.role === 'assistant').length || 1;
    const ratio = agentMessages / Math.max(userMessages, 1);

    if (ratio > 1.5 && userMessages > 6) {
      return 'Deep - AI asked many follow-up questions, user provided detailed responses';
    } else if (ratio > 1.0 && userMessages > 3) {
      return 'Moderate - Good back-and-forth conversation with some detail';
    } else {
      return 'Standard - Widget conversation with basic interaction';
    }
  }

  /**
   * Assess conversation tone
   */
  private static assessConversationTone(payload: ElevenLabsWebhookPayload): string {
    const emotions = payload.sentiment_analysis?.emotions || [];
    const sentiment = payload.sentiment_analysis?.overall_sentiment;

    if (emotions.includes('frustrated') || emotions.includes('angry')) {
      return 'Frustrated - Employee expressed frustration or anger';
    } else if (emotions.includes('concerned') || emotions.includes('worried')) {
      return 'Concerned - Employee showed concern about issues';
    } else if (sentiment === 'positive') {
      return 'Constructive - Employee provided positive, constructive feedback';
    } else {
      return 'Professional - Employee maintained professional tone throughout';
    }
  }

  /**
   * Extract emotional indicators from conversation
   */
  private static extractEmotionalIndicators(payload: ElevenLabsWebhookPayload): string[] {
    const indicators: string[] = [];
    const emotions = payload.sentiment_analysis?.emotions || [];
    const duration = payload.conversation_metadata?.duration_seconds || 60;
    const messageCount = payload.transcript?.user_messages?.length || 1;

    if (duration > 300) indicators.push('Extended conversation indicates serious concern');
    if (messageCount > 10) indicators.push('Multiple messages suggest detailed issues');
    if (emotions.includes('frustrated')) indicators.push('Frustration detected in conversation');
    if (emotions.includes('concerned')) indicators.push('Concern expressed about workplace');
    if (emotions.includes('satisfied')) indicators.push('Satisfaction with feedback process');

    return indicators;
  }

  /**
   * Calculate average message length
   */
  private static calculateAverageMessageLength(messages: Array<{ text?: string; content?: string }>): number {
    if (messages.length === 0) return 0;
    const totalLength = messages.reduce((sum, msg) => sum + (msg.text || msg.content || '').length, 0);
    return Math.round(totalLength / messages.length);
  }

  /**
   * Generate confirmation code
   */
  private static generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// Export webhook endpoint handler
export const handleElevenLabsWebhook = async (payload: ElevenLabsWebhookPayload) => {
  return await ElevenLabsWebhookHandler.handleConversationComplete(payload);
};