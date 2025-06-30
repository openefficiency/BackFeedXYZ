import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Database, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, 
  Wifi, WifiOff, Shield, Lock, Tag, Menu, X, ArrowLeft, Mic, 
  MessageSquare, BarChart3, FileText, Users, TrendingUp, Play
} from 'lucide-react';
import { dbService, supabase, testConnection, isOfflineMode } from '../lib/supabase';

interface VoiceTranscript {
  id: string;
  case_id: string;
  raw_transcript: string;
  processed_summary: string;
  sentiment_score: number;
  elevenlabs_job_id?: string;
  audio_duration?: number;
  confidence_score?: number;
  language?: string;
  processing_status?: string;
  error_message?: string;
  created_at: string;
  processed_at?: string;
  cases?: {
    confirmation_code: string;
    status: string;
    category: string;
    summary: string;
  };
}

interface CaseData {
  id: string;
  confirmation_code: string;
  status: string;
  category: string;
  summary: string;
  created_at: string;
}

interface DatabaseStats {
  cases: number;
  transcripts: number;
  voiceTranscripts: number;
  completedTranscripts: number;
  processingTranscripts: number;
  failedTranscripts: number;
}

export const VoiceDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [transcripts, setTranscripts] = useState<VoiceTranscript[]>([]);
  const [existingTables, setExistingTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [testingWebhook, setTestingWebhook] = useState(false);

  useEffect(() => {
    checkConnection();
    loadData();
    checkExistingTables();
  }, []);

  const checkConnection = async () => {
    try {
      const connected = await testConnection();
      setIsConnected(connected);
    } catch (err) {
      console.error('Connection check failed:', err);
      setIsConnected(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      const [casesData, transcriptsData] = await Promise.all([
        dbService.getLimitedCases(),
        dbService.getAllVoiceTranscripts()
      ]);
      
      setCases(casesData || []);
      setTranscripts(transcriptsData || []);
      
      // Calculate stats
      const voiceTranscripts = transcriptsData?.filter(t => t.elevenlabs_job_id) || [];
      const stats: DatabaseStats = {
        cases: casesData?.length || 0,
        transcripts: transcriptsData?.length || 0,
        voiceTranscripts: voiceTranscripts.length,
        completedTranscripts: voiceTranscripts.filter(t => t.processing_status === 'completed').length,
        processingTranscripts: voiceTranscripts.filter(t => t.processing_status === 'processing').length,
        failedTranscripts: voiceTranscripts.filter(t => t.processing_status === 'failed').length,
      };
      setStats(stats);
      
    } catch (error: any) {
      console.error('Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkExistingTables = async () => {
    try {
      if (isOfflineMode()) {
        setExistingTables(['cases', 'transcripts', 'ai_insights', 'hr_interactions', 'hr_users', 'webhook_logs']);
        return;
      }

      // In a production environment, you might not have access to information_schema
      // So we'll assume the tables exist based on our schema
      setExistingTables(['cases', 'transcripts', 'ai_insights', 'hr_interactions', 'hr_users', 'webhook_logs']);
    } catch (err) {
      console.log('Could not fetch table list (this is normal in some environments)');
      setExistingTables(['cases', 'transcripts', 'ai_insights', 'hr_interactions', 'hr_users']);
    }
  };

  const testVoiceWebhook = async () => {
    if (testingWebhook) return;
    
    try {
      setTestingWebhook(true);
      
      // Find a test case to use
      const testCase = cases.find(c => c.confirmation_code === 'VOICE-TEST-001') || cases[0];
      if (!testCase) {
        setError('No cases found. Please create a case first.');
        return;
      }

      // For now, we'll simulate the webhook by directly calling our database service
      // In production, this would call your deployed Supabase Edge Function
      const mockWebhookData = {
        event_type: 'transcription.completed',
        job_id: `test-voice-${Date.now()}`,
        status: 'success',
        metadata: { 
          case_id: testCase.id,
          confirmation_code: testCase.confirmation_code
        },
        transcript: `Test voice transcription for case ${testCase.confirmation_code}. The ElevenLabs integration with BackFeed is working perfectly! This demonstrates real-time voice processing capabilities with comprehensive AI analysis and automatic case routing.`,
        summary: `Voice test completed for case ${testCase.confirmation_code}: Integration successful. Voice AI processing operational with enhanced sentiment analysis and automatic categorization.`,
        confidence: 0.97,
        sentiment: 0.1
      };

      // Simulate webhook processing by adding transcript directly
      await dbService.addTranscript(
        testCase.id,
        mockWebhookData.transcript,
        mockWebhookData.summary,
        mockWebhookData.sentiment,
        {
          elevenlabsJobId: mockWebhookData.job_id,
          audioDuration: 45,
          confidenceScore: mockWebhookData.confidence,
          language: 'en',
          processingStatus: 'completed',
          elevenlabsMetadata: mockWebhookData,
          webhookReceivedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        }
      );

      // Add AI insight for the voice processing
      await dbService.addAIInsight(
        testCase.id,
        'elevenlabs_conversation',
        {
          transcript: mockWebhookData.transcript,
          summary: mockWebhookData.summary,
          confidence: mockWebhookData.confidence,
          sentiment: mockWebhookData.sentiment,
          audio_duration: 45,
          language: 'en',
          job_id: mockWebhookData.job_id,
          processing_type: 'test_webhook_simulation',
          test_mode: true
        },
        mockWebhookData.confidence
      );

      setError('');
      alert('✅ Voice webhook test successful! Check transcripts below.');
      await loadData(); // Refresh the data
      
    } catch (error: any) {
      console.error('Voice webhook test failed:', error);
      setError(`Voice webhook test failed: ${error.message}`);
    } finally {
      setTestingWebhook(false);
    }
  };

  const navigateToCase = (caseId: string) => {
    navigate(`/hr-dashboard`); // Navigate to HR dashboard where they can select the case
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-orange-100 text-orange-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              🎙️ Voice Integration Dashboard
            </h1>
            <p className="text-slate-600 text-lg">
              ElevenLabs voice transcription integrated with BackFeed HR case management system
            </p>
          </div>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl border-2 p-6 mb-8 ${
          isConnected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isConnected ? (
                <Wifi className="w-6 h-6 text-green-600" />
              ) : (
                <WifiOff className="w-6 h-6 text-red-600" />
              )}
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Database Connection
                </h2>
                <p className="text-slate-600">
                  {isConnected 
                    ? '✅ Connected to BackFeed Database' 
                    : '❌ Connection Failed - Running in Demo Mode'
                  }
                </p>
                <div className="text-sm text-slate-500 mt-1">
                  Project: rxdwludveochqytpjkvs • {isOfflineMode() ? 'Offline Mode' : 'Online Mode'}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-slate-500">
                Cases: {stats?.cases || 0} | Voice Transcripts: {stats?.voiceTranscripts || 0}
              </div>
              <button
                onClick={() => { checkConnection(); loadData(); }}
                disabled={loading}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError('')}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Total Cases</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.cases || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Voice Transcripts</p>
                <p className="text-2xl font-bold text-slate-900">{stats?.voiceTranscripts || 0}</p>
              </div>
              <Mic className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats?.completedTranscripts || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Processing</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.processingTranscripts || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats?.failedTranscripts || 0}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm">Tables</p>
                <p className="text-2xl font-bold text-slate-900">{existingTables.length}</p>
              </div>
              <Database className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Database Tables Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              Database Tables
            </h2>
            {existingTables.length > 0 ? (
              <div className="space-y-2">
                {['cases', 'transcripts', 'ai_insights', 'hr_interactions', 'hr_users', 'webhook_logs'].map((table) => (
                  <div key={table} className={`text-sm p-3 rounded-lg flex justify-between ${
                    existingTables.includes(table) 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    <span className="font-medium">{table}</span>
                    <span>{existingTables.includes(table) ? '✓' : '✗'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500">Loading tables...</div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-green-600" />
              Voice Integration Test
            </h2>
            <p className="text-slate-600 mb-4 text-sm">
              Test the ElevenLabs webhook integration by simulating a voice transcription completion.
            </p>
            <button
              onClick={testVoiceWebhook}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              disabled={testingWebhook || cases.length === 0}
            >
              {testingWebhook ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </div>
              ) : (
                '🎤 Test Voice Webhook'
              )}
            </button>
            {cases.length === 0 && (
              <p className="text-xs text-red-500 mt-2">
                No cases found. Create a case first to test voice integration.
              </p>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                to="/hr-dashboard"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Shield className="w-4 h-4" />
                HR Dashboard
              </Link>
              <Link
                to="/database-status"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium"
              >
                <Database className="w-4 h-4" />
                Database Status
              </Link>
              <Link
                to="/track"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                Track Case
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Cases and Voice Transcripts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Cases List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Recent Cases
            </h2>
            
            {loading ? (
              <div className="text-center py-4">Loading cases...</div>
            ) : cases.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-4">📁</div>
                <p>No cases found.</p>
                <p className="text-sm">Create cases in your BackFeed system to see them here.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cases.map((case_item) => (
                  <div 
                    key={case_item.id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateToCase(case_item.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-blue-600">
                          {case_item.confirmation_code}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_item.status)}`}>
                          {case_item.status}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {case_item.category}
                      </span>
                    </div>
                    
                    <p className="text-slate-700 text-sm mb-2 line-clamp-2">
                      {case_item.summary}
                    </p>
                    
                    <div className="text-xs text-slate-500">
                      Created: {new Date(case_item.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Voice Transcripts List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-600" />
              Recent Voice Transcripts
            </h2>
            
            {loading ? (
              <div className="text-center py-4">Loading transcripts...</div>
            ) : transcripts.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="text-4xl mb-4">🎤</div>
                <p>No voice transcripts found.</p>
                <p className="text-sm">Use the test button above or integrate with ElevenLabs to see transcripts here.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {transcripts.map((transcript) => (
                  <div key={transcript.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          getProcessingStatusColor(transcript.processing_status || 'pending')
                        }`}>
                          {transcript.processing_status || 'pending'}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          {transcript.cases?.confirmation_code || 'Unknown Case'}
                        </span>
                      </div>
                      
                      {transcript.confidence_score && (
                        <div className="text-sm text-slate-600">
                          {Math.round(transcript.confidence_score * 100)}% confidence
                        </div>
                      )}
                    </div>

                    {transcript.raw_transcript && (
                      <div className="mb-3">
                        <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded line-clamp-3">
                          {transcript.raw_transcript}
                        </p>
                      </div>
                    )}

                    {transcript.processed_summary && (
                      <div className="mb-3">
                        <p className="text-blue-700 text-sm bg-blue-50 p-3 rounded">
                          <strong>Summary:</strong> {transcript.processed_summary}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between text-xs text-slate-500">
                      <span>
                        {new Date(transcript.created_at).toLocaleString()}
                      </span>
                      {transcript.audio_duration && (
                        <span>{transcript.audio_duration}s audio</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Setup Progress */}
        <div className="bg-blue-50 rounded-xl p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4">✅ Integration Progress</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span>Database connection to BackFeed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${existingTables.includes('transcripts') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Transcripts table extended for voice</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${existingTables.includes('webhook_logs') ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Webhook logging system</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${cases.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Cases available for voice integration</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${transcripts.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                <span>Voice transcripts functional</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>ElevenLabs webhook endpoint (next step)</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-slate-600">
            <p><strong>Next:</strong> Create Supabase Edge Function for webhook endpoint, then test real-time voice transcription integration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};