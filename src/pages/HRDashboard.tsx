import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, Filter, BarChart3, Clock, AlertCircle, 
  CheckCircle, MessageSquare, TrendingUp, Users, FileText,
  Calendar, Eye, ArrowUpRight, Shield, Lock, Tag, Menu, X,
  ChevronLeft, ChevronRight, Send, Plus, Home, Mic, Volume2,
  Play, Pause, SkipForward, Database
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { dbService } from '../lib/supabase';

interface Case {
  id: string;
  confirmation_code: string;
  status: 'open' | 'investigating' | 'closed';
  severity: number;
  category: string;
  summary: string;
  created_at: string;
  updated_at: string;
  transcripts: Array<{
    id: string;
    raw_transcript: string;
    processed_summary: string;
    sentiment_score: number;
    elevenlabs_job_id?: string;
    audio_duration?: number;
    confidence_score?: number;
    processing_status?: string;
    created_at: string;
  }>;
  hr_interactions: Array<{
    id: string;
    message: string;
    sender_type: 'employee' | 'hr_manager' | 'system';
    sender_name: string;
    created_at: string;
  }>;
  ai_insights: Array<{
    id: string;
    insight_type: string;
    content: any;
    confidence_score: number;
  }>;
}

interface VoiceSummary {
  total_transcripts: number;
  completed_transcripts: number;
  processing_transcripts: number;
  failed_transcripts: number;
  total_audio_duration: number;
  avg_confidence: number;
  avg_sentiment: number;
  latest_transcript: string;
  latest_summary: string;
  latest_processing_status: string;
}

export const HRDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileView, setMobileView] = useState<'cases' | 'chat' | 'analytics'>('cases');
  const [voiceSummary, setVoiceSummary] = useState<VoiceSummary | null>(null);
  const [voiceTranscripts, setVoiceTranscripts] = useState<any[]>([]);
  const [loadingVoice, setLoadingVoice] = useState(false);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('hrAuth');
    if (!isAuthenticated) {
      navigate('/hr-login');
      return;
    }

    loadCases();
  }, [navigate]);

  useEffect(() => {
    // Load voice data when a case is selected
    if (selectedCase) {
      loadVoiceData(selectedCase.id);
      
      // Subscribe to real-time voice updates
      const subscription = dbService.subscribeToVoiceUpdates(
        selectedCase.id,
        (payload) => {
          console.log('🔄 Real-time voice update received:', payload);
          
          if (payload.eventType === 'INSERT') {
            setVoiceTranscripts(prev => [payload.new, ...prev]);
            loadVoiceData(selectedCase.id); // Refresh summary
          } else if (payload.eventType === 'UPDATE') {
            setVoiceTranscripts(prev => 
              prev.map(t => t.id === payload.new.id ? payload.new : t)
            );
            if (payload.new.processing_status === 'completed') {
              loadVoiceData(selectedCase.id); // Refresh summary
            }
          }
        }
      );

      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    }
  }, [selectedCase]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await dbService.getCases();
      setCases(data);
    } catch (err: any) {
      setError(`Failed to load cases: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadVoiceData = async (caseId: string) => {
    try {
      setLoadingVoice(true);
      
      const [summary, transcripts] = await Promise.all([
        dbService.getVoiceSummary(caseId),
        dbService.getVoiceTranscripts(caseId)
      ]);
      
      setVoiceSummary(summary);
      setVoiceTranscripts(transcripts || []);
    } catch (err: any) {
      console.error('Failed to load voice data:', err);
    } finally {
      setLoadingVoice(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('hrAuth');
    navigate('/hr-login');
  };

  const goToDashboard = () => {
    setSelectedCase(null);
    setMobileView('analytics');
  };

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = case_.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.confirmation_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || case_.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'investigating': return 'text-orange-600 bg-orange-100';
      case 'closed': return 'text-green-600 bg-green-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4" />;
      case 'investigating': return <AlertCircle className="w-4 h-4" />;
      case 'closed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return 'text-red-600 bg-red-100';
    if (severity >= 3) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getProcessingStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const updateCaseStatus = async (caseId: string, newStatus: 'open' | 'investigating' | 'closed') => {
    try {
      await dbService.updateCaseStatus(caseId, newStatus);
      await loadCases(); // Refresh cases
      
      // Update selected case if it's the one being updated
      if (selectedCase && selectedCase.id === caseId) {
        const updatedCase = cases.find(c => c.id === caseId);
        if (updatedCase) {
          setSelectedCase({ ...updatedCase, status: newStatus });
        }
      }
    } catch (err: any) {
      setError(`Failed to update case status: ${err.message}`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCase || sendingMessage) return;

    setSendingMessage(true);
    try {
      await dbService.addInteraction(selectedCase.id, newMessage, 'hr_manager', 'Sarah Johnson');
      
      // Refresh case data
      const updatedCases = await dbService.getCases();
      setCases(updatedCases);
      
      const updatedCase = updatedCases.find(c => c.id === selectedCase.id);
      if (updatedCase) {
        setSelectedCase(updatedCase);
      }
      
      setNewMessage('');
    } catch (err: any) {
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setSendingMessage(false);
    }
  };

  // Check if case has AI processing
  const hasAIProcessing = (case_: Case) => {
    return case_.ai_insights.some(insight => 
      insight.insight_type === 'elevenlabs_conversation' || 
      insight.insight_type === 'elevenlabs_realtime' ||
      insight.insight_type === 'deepgram_realtime'
    );
  };

  // Check if case has voice transcripts
  const hasVoiceTranscripts = (case_: Case) => {
    return case_.transcripts.some(transcript => transcript.elevenlabs_job_id);
  };

  // Get AI metadata with enhanced information
  const getAIMetadata = (case_: Case) => {
    const aiInsight = case_.ai_insights.find(insight => 
      insight.insight_type === 'elevenlabs_conversation' || 
      insight.insight_type === 'elevenlabs_realtime' ||
      insight.insight_type === 'deepgram_realtime'
    );
    return aiInsight?.content || null;
  };

  // Get case title from AI insights
  const getCaseTitle = (case_: Case) => {
    const aiData = getAIMetadata(case_);
    return aiData?.case_title || case_.category;
  };

  // Get key topics from AI insights
  const getKeyTopics = (case_: Case) => {
    const aiData = getAIMetadata(case_);
    return aiData?.key_topics || [];
  };

  // Get urgency indicators from AI insights
  const getUrgencyIndicators = (case_: Case) => {
    const aiData = getAIMetadata(case_);
    return aiData?.urgency_indicators || [];
  };

  // Analytics data
  const analyticsData = {
    casesByDay: cases.reduce((acc, case_) => {
      const date = new Date(case_.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    casesByCategory: cases.reduce((acc, case_) => {
      acc[case_.category] = (acc[case_.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    
    casesByStatus: cases.reduce((acc, case_) => {
      acc[case_.status] = (acc[case_.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),

    aiProcessedCases: cases.filter(hasAIProcessing).length,
    voiceProcessedCases: cases.filter(hasVoiceTranscripts).length
  };

  const chartData = {
    casesByCategory: Object.entries(analyticsData.casesByCategory).map(([name, value], index) => ({
      name,
      value,
      color: ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'][index % 5]
    })),
    
    casesByDay: Object.entries(analyticsData.casesByDay)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-7)
      .map(([date, cases]) => ({ date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), cases }))
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading HR Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadCases}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">HR Dashboard</h1>
              <p className="text-slate-600 text-sm hidden md:block">Enhanced AI-Powered Employee Feedback Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Navigation */}
            <div className="md:hidden flex bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setMobileView('cases')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  mobileView === 'cases' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Cases
              </button>
              {selectedCase && (
                <button
                  onClick={() => setMobileView('chat')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    mobileView === 'chat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Chat
                </button>
              )}
              <button
                onClick={() => setMobileView('analytics')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  mobileView === 'analytics' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600'
                }`}
              >
                Stats
              </button>
            </div>

            {/* Voice Processing Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
              <Mic className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">
                Voice: {analyticsData.voiceProcessedCases}
              </span>
            </div>

            {/* AI Processing Status */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                AI: {analyticsData.aiProcessedCases}
              </span>
            </div>

            {/* Voice Dashboard Button */}
            <button
              onClick={() => navigate('/voice-dashboard')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Database className="w-4 h-4" />
              Voice Dashboard
            </button>

            {/* Dashboard Button - Desktop */}
            <button
              onClick={goToDashboard}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden mt-4 pt-4 border-t border-slate-200">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Mic className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  Voice Processed: {analyticsData.voiceProcessedCases} cases
                </span>
              </div>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">
                  AI Processed: {analyticsData.aiProcessedCases} cases
                </span>
              </div>
              
              {/* Voice Dashboard Button - Mobile */}
              <button
                onClick={() => {
                  navigate('/voice-dashboard');
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
              >
                <Database className="w-5 h-5" />
                Voice Dashboard
              </button>
              
              {/* Dashboard Button - Mobile */}
              <button
                onClick={() => {
                  goToDashboard();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <BarChart3 className="w-5 h-5" />
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Desktop Sidebar - Cases List */}
        <div className={`${mobileView === 'cases' ? 'block' : 'hidden'} md:block w-full md:w-1/3 bg-white border-r border-slate-200 overflow-y-auto`}>
          <div className="p-4 md:p-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="space-y-3">
              {filteredCases.map((case_) => {
                const caseTitle = getCaseTitle(case_);
                const keyTopics = getKeyTopics(case_);
                const urgencyIndicators = getUrgencyIndicators(case_);
                const hasVoice = hasVoiceTranscripts(case_);
                
                return (
                  <div
                    key={case_.id}
                    onClick={() => {
                      setSelectedCase(case_);
                      setMobileView('chat');
                    }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCase?.id === case_.id 
                        ? 'border-blue-300 bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                          {getStatusIcon(case_.status)}
                          {case_.status}
                        </span>
                        {hasAIProcessing(case_) && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                            <MessageSquare className="w-3 h-3" />
                            AI
                          </div>
                        )}
                        {hasVoice && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                            <Mic className="w-3 h-3" />
                            Voice
                          </div>
                        )}
                        {urgencyIndicators.length > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                            <AlertCircle className="w-3 h-3" />
                            Urgent
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(case_.severity)}`}>
                        P{case_.severity}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
                      {caseTitle}
                    </h3>
                    
                    {/* Key Topics */}
                    {keyTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {keyTopics.slice(0, 2).map((topic, index) => (
                          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            <Tag className="w-3 h-3" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {case_.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>#{case_.confirmation_code}</span>
                      <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Chat View */}
          {selectedCase && (mobileView === 'chat' || window.innerWidth >= 768) && (
            <div className={`${mobileView === 'chat' ? 'block' : 'hidden'} md:block h-full flex flex-col`}>
              {/* Chat Header */}
              <div className="bg-white border-b border-slate-200 p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileView('cases')}
                      className="md:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {getCaseTitle(selectedCase)}
                      </h2>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>#{selectedCase.confirmation_code}</span>
                        <span>•</span>
                        <span>{new Date(selectedCase.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Dashboard Button in Chat Header - Desktop */}
                    <button
                      onClick={goToDashboard}
                      className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      <Home className="w-4 h-4" />
                      Dashboard
                    </button>
                    <select
                      value={selectedCase.status}
                      onChange={(e) => updateCaseStatus(selectedCase.id, e.target.value as any)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCase.status)}`}>
                    {getStatusIcon(selectedCase.status)}
                    {selectedCase.status.charAt(0).toUpperCase() + selectedCase.status.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(selectedCase.severity)}`}>
                    Priority: {selectedCase.severity}/5
                  </span>
                  {hasAIProcessing(selectedCase) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      <MessageSquare className="w-4 h-4" />
                      AI Processed
                    </span>
                  )}
                  {hasVoiceTranscripts(selectedCase) && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <Mic className="w-4 h-4" />
                      Voice Processed
                    </span>
                  )}
                </div>
              </div>

              {/* Voice Summary Section */}
              {voiceSummary && voiceSummary.total_transcripts > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 p-4 md:p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-purple-600" />
                    Voice Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{voiceSummary.total_transcripts}</div>
                      <div className="text-purple-800">Total Recordings</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{voiceSummary.completed_transcripts}</div>
                      <div className="text-green-800">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(voiceSummary.total_audio_duration / 60)}m</div>
                      <div className="text-blue-800">Total Audio</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {voiceSummary.avg_confidence ? Math.round(voiceSummary.avg_confidence * 100) : 0}%
                      </div>
                      <div className="text-orange-800">Avg Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${
                        voiceSummary.avg_sentiment > 0.1 ? 'text-green-600' :
                        voiceSummary.avg_sentiment < -0.1 ? 'text-red-600' :
                        'text-gray-600'
                      }`}>
                        {voiceSummary.avg_sentiment > 0.1 ? '😊' :
                         voiceSummary.avg_sentiment < -0.1 ? '😞' : '😐'}
                      </div>
                      <div className="text-slate-600">Sentiment</div>
                    </div>
                  </div>
                  
                  {voiceSummary.latest_summary && (
                    <div className="mt-4 p-3 bg-white rounded-lg">
                      <h4 className="font-medium mb-2">Latest Voice Summary:</h4>
                      <p className="text-slate-700 text-sm">{voiceSummary.latest_summary}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Transcripts Section */}
              {voiceTranscripts.length > 0 && (
                <div className="bg-white border-b border-slate-200 p-4 md:p-6">
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-green-600" />
                    Voice Transcripts ({voiceTranscripts.length})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {voiceTranscripts.map((transcript) => (
                      <div key={transcript.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getProcessingStatusColor(transcript.processing_status || 'pending')
                          }`}>
                            {transcript.processing_status || 'pending'}
                          </span>
                          {transcript.confidence_score && (
                            <span className="text-xs text-slate-600">
                              {Math.round(transcript.confidence_score * 100)}% confidence
                            </span>
                          )}
                        </div>
                        
                        {transcript.processed_summary && (
                          <p className="text-sm text-slate-700 mb-2">
                            {transcript.processed_summary}
                          </p>
                        )}
                        
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>{new Date(transcript.created_at).toLocaleString()}</span>
                          {transcript.audio_duration && (
                            <span>{transcript.audio_duration}s</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 p-4 md:p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedCase.hr_interactions
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`flex ${interaction.sender_type === 'employee' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                          interaction.sender_type === 'employee' 
                            ? 'bg-slate-100 text-slate-900' 
                            : interaction.sender_type === 'system'
                            ? 'bg-blue-50 text-blue-900 border border-blue-200'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{interaction.message}</p>
                        <p className={`text-xs mt-2 ${
                          interaction.sender_type === 'employee' 
                            ? 'text-slate-500' 
                            : interaction.sender_type === 'system'
                            ? 'text-blue-600'
                            : 'text-blue-100'
                        }`}>
                          {interaction.sender_type === 'system' ? 'System' : 
                           interaction.sender_type === 'hr_manager' ? interaction.sender_name : 'Employee'} • 
                          {new Date(interaction.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              {selectedCase.status !== 'closed' && (
                <div className="bg-white border-t border-slate-200 p-4 md:p-6">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your response..."
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                    />
                    <button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span className="hidden md:inline">Send</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics View */}
          {(mobileView === 'analytics' || (!selectedCase && window.innerWidth >= 768)) && (
            <div className={`${mobileView === 'analytics' ? 'block' : 'hidden'} md:block p-4 md:p-6 space-y-6`}>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 md:gap-6">
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Total Cases</p>
                      <p className="text-2xl font-bold text-slate-900">{cases.length}</p>
                    </div>
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Open</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.open || 0}</p>
                    </div>
                    <Clock className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                  </div>
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Investigating</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.investigating || 0}</p>
                    </div>
                    <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Closed</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.closed || 0}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Voice Processed</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.voiceProcessedCases}</p>
                    </div>
                    <Mic className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">AI Processed</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.aiProcessedCases}</p>
                    </div>
                    <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts - Hidden on mobile when not in analytics view */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Cases by Category</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={chartData.casesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {chartData.casesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {chartData.casesByCategory.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-slate-600">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Daily Case Volume</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData.casesByDay}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="cases" 
                        stroke="#3B82F6" 
                        strokeWidth={3}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Enhanced Voice & AI Technology Status */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  Enhanced Voice & AI Technology Processing Status
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-purple-800">
                    <p className="font-medium mb-1">Voice Processing (ElevenLabs)</p>
                    <p>✓ {analyticsData.voiceProcessedCases} voice conversations processed</p>
                    <p>✓ Real-time transcription enabled</p>
                    <p>✓ Voice sentiment analysis</p>
                    <p>✓ Audio quality assessment</p>
                    <p>✓ Automatic case routing</p>
                  </div>
                  <div className="text-blue-800">
                    <p className="font-medium mb-1">AI Processing & Analysis</p>
                    <p>✓ {analyticsData.aiProcessedCases} AI-enhanced conversations</p>
                    <p>✓ Intelligent case categorization</p>
                    <p>✓ Priority assignment automation</p>
                    <p>✓ Key topic extraction</p>
                    <p>✓ Urgency indicator detection</p>
                  </div>
                  <div className="text-green-800">
                    <p className="font-medium mb-1">Integration & Security</p>
                    <p>✓ End-to-end encryption</p>
                    <p>✓ Real-time webhook processing</p>
                    <p>✓ Comprehensive audit trail</p>
                    <p>✓ Advanced case categorization</p>
                    <p>✓ Intelligent priority assignment</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State for Desktop */}
          {!selectedCase && mobileView !== 'analytics' && window.innerWidth >= 768 && (
            <div className="hidden md:flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Select a Case to Start</h3>
                <p className="text-slate-600">Choose a case from the sidebar to view details and communicate with employees.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};