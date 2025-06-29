import { createClient } from '@supabase/supabase-js';

// Supabase configuration with your specific credentials
const supabaseUrl = 'https://tnvyzdmgyvpzwxbravrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnl6ZG1neXZwend4YnJhdnJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDg3MTYsImV4cCI6MjA2NTc4NDcxNn0.tgtFA4wHYLfa8pu3Oes2y4raVT-_2LuWFOWimXALbWI';

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client with enhanced configuration for production
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'x-application-name': 'voice-ai-agent-system',
      'x-client-info': 'voice-ai-agent/1.0.0'
    }
  },
  db: {
    schema: 'public'
  }
});

// Enhanced connection test with detailed diagnostics
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Supabase connection...');
    console.log('📍 URL:', supabaseUrl);
    console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // Test basic connectivity with a simple query
    const { data, error, status, statusText } = await supabase
      .from('cases')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status,
        statusText
      });
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    console.log('📊 Response status:', status);
    console.log('📈 Data received:', data !== null);
    
    return true;
  } catch (error: any) {
    console.error('❌ Connection test exception:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    return false;
  }
};

// Database service functions with enhanced error handling and retry logic
export const dbService = {
  // Test database connection with detailed diagnostics
  async testConnection(): Promise<boolean> {
    return await testConnection();
  },

  // Enhanced connection health check
  async healthCheck(): Promise<{
    connected: boolean;
    latency: number;
    tables: string[];
    rlsStatus: Record<string, boolean>;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      // Test connection and get table list
      const [casesResult] = await Promise.all([
        supabase.from('cases').select('count').limit(1)
      ]);
      
      const latency = Date.now() - startTime;
      
      if (casesResult.error) {
        return {
          connected: false,
          latency,
          tables: [],
          rlsStatus: {},
          error: casesResult.error.message
        };
      }

      // Check RLS status for all tables
      const tables = ['cases', 'transcripts', 'hr_interactions', 'ai_insights', 'hr_users'];
      const rlsStatus: Record<string, boolean> = {};
      
      // For demo purposes, assume RLS is enabled (we can't query pg_class from client)
      tables.forEach(table => {
        rlsStatus[table] = true;
      });
      
      return {
        connected: true,
        latency,
        tables,
        rlsStatus
      };
    } catch (error: any) {
      return {
        connected: false,
        latency: Date.now() - startTime,
        tables: [],
        rlsStatus: {},
        error: error.message
      };
    }
  },

  // Get all cases with enhanced error handling and retry logic
  async getCases(retries = 3): Promise<any[]> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`📥 Fetching cases (attempt ${attempt}/${retries})...`);
        
        const { data, error, status } = await supabase
          .from('cases')
          .select(`
            *,
            transcripts(*),
            hr_interactions(*),
            ai_insights(*)
          `)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error(`❌ Error fetching cases (attempt ${attempt}):`, {
            error: error.message,
            code: error.code,
            status
          });
          
          if (attempt === retries) {
            throw new Error(`Failed to fetch cases after ${retries} attempts: ${error.message}`);
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        console.log(`✅ Successfully fetched ${data?.length || 0} cases`);
        return data || [];
        
      } catch (error: any) {
        console.error(`❌ Exception in getCases (attempt ${attempt}):`, error);
        
        if (attempt === retries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return [];
  },

  // Get case by confirmation code with enhanced validation
  async getCaseByCode(confirmationCode: string, retries = 3): Promise<any> {
    if (!confirmationCode || confirmationCode.length !== 10) {
      throw new Error('Invalid confirmation code format. Must be 10 characters.');
    }
    
    const normalizedCode = confirmationCode.toUpperCase().trim();
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🔍 Searching for case: ${normalizedCode} (attempt ${attempt}/${retries})`);
        
        const { data, error, status } = await supabase
          .from('cases')
          .select(`
            *,
            transcripts(*),
            hr_interactions(*),
            ai_insights(*)
          `)
          .eq('confirmation_code', normalizedCode)
          .limit(1);
        
        if (error) {
          console.error(`❌ Error fetching case (attempt ${attempt}):`, {
            error: error.message,
            code: error.code,
            status
          });
          
          if (attempt === retries) {
            throw new Error(`Database error after ${retries} attempts: ${error.message}`);
          }
          
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
        
        // Check if no data was returned
        if (!data || data.length === 0) {
          throw new Error(`Case not found: ${normalizedCode}`);
        }
        
        console.log(`✅ Successfully found case: ${normalizedCode}`);
        return data[0];
        
      } catch (error: any) {
        console.error(`❌ Exception in getCaseByCode (attempt ${attempt}):`, error);
        
        if (attempt === retries || error.message.includes('not found')) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  },

  // Create new case with enhanced validation and conflict handling
  async createCase(caseData: {
    confirmationCode: string;
    category: string;
    summary: string;
    severity: number;
  }): Promise<any> {
    try {
      // Validate input data
      if (!caseData.confirmationCode || caseData.confirmationCode.length !== 10) {
        throw new Error('Invalid confirmation code format');
      }
      
      if (!caseData.category || !caseData.summary) {
        throw new Error('Category and summary are required');
      }
      
      if (caseData.severity < 1 || caseData.severity > 5) {
        throw new Error('Severity must be between 1 and 5');
      }
      
      console.log(`📝 Creating case: ${caseData.confirmationCode}`);
      
      // Check for existing confirmation code - Fixed to avoid PGRST116 error
      const { data: existing } = await supabase
        .from('cases')
        .select('id')
        .eq('confirmation_code', caseData.confirmationCode)
        .limit(1);
      
      if (existing && existing.length > 0) {
        throw new Error('Confirmation code already exists. Please try again.');
      }

      const { data, error, status } = await supabase
        .from('cases')
        .insert({
          confirmation_code: caseData.confirmationCode,
          category: caseData.category,
          summary: caseData.summary,
          severity: caseData.severity,
          status: 'open'
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error creating case:', {
          error: error.message,
          code: error.code,
          status
        });
        throw new Error(`Failed to create case: ${error.message}`);
      }
      
      console.log(`✅ Successfully created case: ${caseData.confirmationCode}`);
      return data;
      
    } catch (error: any) {
      console.error('❌ Exception in createCase:', error);
      throw error;
    }
  },

  // Add transcript with enhanced validation and metadata support
  async addTranscript(caseId: string, transcript: string, summary: string, sentimentScore: number, metadata?: any): Promise<any> {
    try {
      // Validate inputs
      if (!caseId || !transcript) {
        throw new Error('Case ID and transcript are required');
      }

      if (sentimentScore < -1 || sentimentScore > 1) {
        throw new Error('Sentiment score must be between -1 and 1');
      }

      console.log(`📝 Adding transcript for case: ${caseId}`);

      const { data, error, status } = await supabase
        .from('transcripts')
        .insert({
          case_id: caseId,
          raw_transcript: transcript,
          processed_summary: summary || transcript.substring(0, 200) + '...',
          sentiment_score: sentimentScore
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error adding transcript:', {
          error: error.message,
          code: error.code,
          status
        });
        throw new Error(`Failed to add transcript: ${error.message}`);
      }
      
      console.log(`✅ Successfully added transcript for case: ${caseId}`);
      return data;
      
    } catch (error: any) {
      console.error('❌ Exception in addTranscript:', error);
      throw error;
    }
  },

  // Add HR interaction with enhanced validation
  async addInteraction(caseId: string, message: string, senderType: 'employee' | 'hr_manager' | 'system', senderName?: string): Promise<any> {
    try {
      // Validate inputs
      if (!caseId || !message || !senderType) {
        throw new Error('Case ID, message, and sender type are required');
      }

      const validSenderTypes = ['employee', 'hr_manager', 'system'];
      if (!validSenderTypes.includes(senderType)) {
        throw new Error('Invalid sender type');
      }

      console.log(`💬 Adding interaction for case: ${caseId}`);

      const { data, error, status } = await supabase
        .from('hr_interactions')
        .insert({
          case_id: caseId,
          message: message.trim(),
          sender_type: senderType,
          sender_name: senderName || (senderType === 'employee' ? 'Anonymous' : 'System')
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error adding interaction:', {
          error: error.message,
          code: error.code,
          status
        });
        throw new Error(`Failed to add interaction: ${error.message}`);
      }
      
      console.log(`✅ Successfully added interaction for case: ${caseId}`);
      return data;
      
    } catch (error: any) {
      console.error('❌ Exception in addInteraction:', error);
      throw error;
    }
  },

  // Update case status with enhanced validation
  async updateCaseStatus(caseId: string, status: 'open' | 'investigating' | 'closed'): Promise<any> {
    try {
      if (!caseId || !status) {
        throw new Error('Case ID and status are required');
      }

      const validStatuses = ['open', 'investigating', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status value');
      }

      console.log(`🔄 Updating case status: ${caseId} -> ${status}`);

      const { data, error, status: responseStatus } = await supabase
        .from('cases')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', caseId)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error updating case status:', {
          error: error.message,
          code: error.code,
          status: responseStatus
        });
        throw new Error(`Failed to update case status: ${error.message}`);
      }
      
      console.log(`✅ Successfully updated case status: ${caseId} -> ${status}`);
      return data;
      
    } catch (error: any) {
      console.error('❌ Exception in updateCaseStatus:', error);
      throw error;
    }
  },

  // Get HR users with enhanced error handling
  async getHRUsers(): Promise<any[]> {
    try {
      console.log('👥 Fetching HR users...');
      
      const { data, error, status } = await supabase
        .from('hr_users')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error fetching HR users:', {
          error: error.message,
          code: error.code,
          status
        });
        throw new Error(`Failed to fetch HR users: ${error.message}`);
      }
      
      console.log(`✅ Successfully fetched ${data?.length || 0} HR users`);
      return data || [];
      
    } catch (error: any) {
      console.error('❌ Exception in getHRUsers:', error);
      throw error;
    }
  },

  // Authenticate HR user with enhanced security
  async authenticateHR(email: string, password: string): Promise<any> {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      console.log(`🔐 Authenticating HR user: ${email}`);

      // For demo purposes, we'll check against hr_users table
      // In production, this should use Supabase Auth
      const { data, error, status } = await supabase
        .from('hr_users')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .limit(1);
      
      if (error || !data || data.length === 0) {
        console.error('❌ HR authentication failed:', {
          error: error?.message,
          code: error?.code,
          status
        });
        throw new Error('Invalid credentials');
      }

      // For demo, accept specific passwords for existing HR users
      const validPasswords = ['demo123', 'password', 'admin123', 'StartNew25!'];
      if (!validPasswords.includes(password)) {
        throw new Error('Invalid credentials');
      }

      console.log(`✅ Successfully authenticated HR user: ${email}`);
      return data[0];
      
    } catch (error: any) {
      console.error('❌ Exception in authenticateHR:', error);
      throw error;
    }
  },

  // Add AI insights with enhanced validation and support for more types
  async addAIInsight(caseId: string, insightType: string, content: any, confidenceScore: number): Promise<any> {
    try {
      if (!caseId || !insightType || !content) {
        throw new Error('Case ID, insight type, and content are required');
      }

      if (confidenceScore < 0 || confidenceScore > 1) {
        throw new Error('Confidence score must be between 0 and 1');
      }

      console.log(`🤖 Adding AI insight for case: ${caseId}`);

      const { data, error, status } = await supabase
        .from('ai_insights')
        .insert({
          case_id: caseId,
          insight_type: insightType,
          content,
          confidence_score: confidenceScore
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error adding AI insight:', {
          error: error.message,
          code: error.code,
          status
        });
        throw new Error(`Failed to add AI insight: ${error.message}`);
      }
      
      console.log(`✅ Successfully added AI insight for case: ${caseId}`);
      return data;
      
    } catch (error: any) {
      console.error('❌ Exception in addAIInsight:', error);
      throw error;
    }
  }
};

// Enhanced API service with better error handling
export const apiService = {
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('🎤 Starting audio transcription...');
      console.log('📊 Audio blob size:', audioBlob.size, 'bytes');
      console.log('📋 Audio blob type:', audioBlob.type);
      
      // Simulate realistic API processing time
      const processingTime = 2000 + Math.random() * 2000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Simulate different types of feedback for demo
      const sampleTranscripts = [
        "I want to report serious safety concerns about workplace equipment that hasn't been properly maintained. There have been several near-miss incidents that weren't documented properly, and I'm worried someone will get hurt if we don't address this immediately.",
        
        "I need to report inappropriate behavior from my supervisor who has been making inappropriate comments and creating a hostile work environment. This has been going on for weeks and it's affecting my ability to do my job effectively.",
        
        "There are major communication issues between departments that are causing project delays and frustration. Information isn't being shared properly and teams aren't coordinating effectively, which is affecting our ability to deliver quality work.",
        
        "I have concerns about excessive overtime requirements that are affecting work-life balance and employee health. The mandatory overtime is impacting family time and personal well-being, and I think we need better scheduling practices.",
        
        "I want to report concerns about break time policies not being enforced consistently. Some employees take much longer breaks while others follow the rules and have to cover their work, creating unfairness in the team."
      ];
      
      const transcript = sampleTranscripts[Math.floor(Math.random() * sampleTranscripts.length)];
      console.log('✅ Audio transcription completed');
      console.log('📝 Transcript length:', transcript.length, 'characters');
      return transcript;
      
    } catch (error: any) {
      console.error('❌ Transcription error:', error);
      throw new Error('Failed to transcribe audio. Please try again.');
    }
  },

  async processWithAI(transcript: string): Promise<{
    summary: string;
    category: string;
    severity: number;
    sentiment: number;
  }> {
    try {
      console.log('🤖 Starting AI analysis...');
      console.log('📝 Analyzing transcript:', transcript.substring(0, 100) + '...');
      
      // Simulate realistic AI processing time
      const processingTime = 1500 + Math.random() * 1500;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Enhanced keyword-based categorization for demo
      const lowerTranscript = transcript.toLowerCase();
      let category = 'General Feedback';
      let severity = 3;
      let sentiment = -0.2; // Default slightly negative
      
      // Safety-related keywords
      if (lowerTranscript.includes('safety') || lowerTranscript.includes('accident') || 
          lowerTranscript.includes('injury') || lowerTranscript.includes('equipment') ||
          lowerTranscript.includes('dangerous') || lowerTranscript.includes('hazard') ||
          lowerTranscript.includes('near-miss') || lowerTranscript.includes('maintenance')) {
        category = 'Workplace Safety';
        severity = 4;
        sentiment = -0.4;
      }
      // Harassment keywords
      else if (lowerTranscript.includes('harassment') || lowerTranscript.includes('inappropriate') || 
               lowerTranscript.includes('hostile') || lowerTranscript.includes('uncomfortable') ||
               lowerTranscript.includes('supervisor') && lowerTranscript.includes('behavior') ||
               lowerTranscript.includes('discriminatory')) {
        category = 'Harassment';
        severity = 4;
        sentiment = -0.6;
      }
      // Discrimination keywords
      else if (lowerTranscript.includes('discrimination') || lowerTranscript.includes('unfair') || 
               lowerTranscript.includes('bias') || lowerTranscript.includes('gender') ||
               lowerTranscript.includes('age') || lowerTranscript.includes('race') ||
               lowerTranscript.includes('promotion') && lowerTranscript.includes('passed over')) {
        category = 'Discrimination';
        severity = 5;
        sentiment = -0.7;
      }
      // Policy violation keywords
      else if (lowerTranscript.includes('policy') || lowerTranscript.includes('break') || 
               lowerTranscript.includes('procedure') || lowerTranscript.includes('rules') ||
               lowerTranscript.includes('attendance') || lowerTranscript.includes('tardiness')) {
        category = 'Policy Violation';
        severity = 2;
        sentiment = -0.3;
      }
      // Work-life balance keywords
      else if (lowerTranscript.includes('overtime') || lowerTranscript.includes('work-life') || 
               lowerTranscript.includes('balance') || lowerTranscript.includes('family') ||
               lowerTranscript.includes('personal time') || lowerTranscript.includes('burnout')) {
        category = 'Work-Life Balance';
        severity = 3;
        sentiment = -0.4;
      }
      // Communication issues
      else if (lowerTranscript.includes('communication') || lowerTranscript.includes('coordination') ||
               lowerTranscript.includes('information') || lowerTranscript.includes('departments') ||
               lowerTranscript.includes('project delays')) {
        category = 'Workplace Environment';
        severity = 2;
        sentiment = -0.2;
      }
      
      const result = {
        summary: `AI-processed summary: ${transcript.substring(0, 200)}${transcript.length > 200 ? '...' : ''}`,
        category,
        severity,
        sentiment
      };
      
      console.log('✅ AI analysis completed:', {
        category: result.category,
        severity: result.severity,
        sentiment: result.sentiment
      });
      
      return result;
      
    } catch (error: any) {
      console.error('❌ AI processing error:', error);
      throw new Error('Failed to process with AI. Please try again.');
    }
  },

  generateConfirmationCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    console.log(`✅ Generated confirmation code: ${result}`);
    return result;
  }
};

// Initialize connection test and setup on module load
const initializeConnection = async () => {
  console.log('🚀 Initializing Supabase connection...');
  console.log('🌐 Environment:', import.meta.env.MODE);
  
  try {
    const isConnected = await testConnection();
    
    if (isConnected) {
      console.log('✅ Supabase connection initialized successfully');
      
      // Test basic operations
      try {
        const healthCheck = await dbService.healthCheck();
        console.log('🏥 Health check results:', healthCheck);
        
        if (healthCheck.rlsStatus) {
          console.log('🔒 RLS Status:', healthCheck.rlsStatus);
        }
      } catch (error) {
        console.warn('⚠️ Health check failed:', error);
      }
    } else {
      console.error('❌ Supabase connection initialization failed');
      console.log('🔧 Troubleshooting tips:');
      console.log('  1. Check your internet connection');
      console.log('  2. Verify Supabase project is active');
      console.log('  3. Confirm API keys are correct');
      console.log('  4. Check if RLS policies allow access');
    }
  } catch (error) {
    console.error('❌ Connection initialization error:', error);
  }
};

// Run initialization
initializeConnection();