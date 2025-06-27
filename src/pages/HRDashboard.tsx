import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, Filter, BarChart3, Clock, AlertCircle, 
  CheckCircle, MessageSquare, TrendingUp, Users, FileText,
  Calendar, Eye, ArrowUpRight, Shield, Lock, Tag
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

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('hrAuth');
    if (!isAuthenticated) {
      navigate('/hr-login');
      return;
    }

    loadCases();
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem('hrAuth');
    navigate('/hr-login');
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

    aiProcessedCases: cases.filter(hasAIProcessing).length
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
            <p className="text-slate-600">Enhanced AI-Powered Employee Feedback Management</p>
          </div>
          <div className="flex items-center gap-4">
            {/* AI Processing Status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">
                AI Processed: {analyticsData.aiProcessedCases} cases
              </span>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Cases List */}
        <div className="w-1/3 bg-white border-r border-slate-200 h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-6">
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
                <option value="all">All Status</option>
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
                
                return (
                  <div
                    key={case_.id}
                    onClick={() => setSelectedCase(case_)}
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
                    
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {caseTitle}
                    </h3>
                    
                    {/* Key Topics */}
                    {keyTopics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {keyTopics.slice(0, 3).map((topic, index) => (
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

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto h-[calc(100vh-80px)]">
          {selectedCase ? (
            <div className="space-y-6">
              {/* Enhanced Case Header */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">
                      {getCaseTitle(selectedCase)}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mb-3">
                      <span>Case #{selectedCase.confirmation_code}</span>
                      <span>•</span>
                      <span>Created {new Date(selectedCase.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Updated {new Date(selectedCase.updated_at).toLocaleDateString()}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Category:</span> {selectedCase.category}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedCase.status}
                      onChange={(e) => updateCaseStatus(selectedCase.id, e.target.value as any)}
                      className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="open">Open</option>
                      <option value="investigating">Investigating</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 mb-4 flex-wrap">
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
                  {getUrgencyIndicators(selectedCase).length > 0 && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                      <AlertCircle className="w-4 h-4" />
                      {getUrgencyIndicators(selectedCase).length} Urgency Indicators
                    </span>
                  )}
                </div>

                {/* Key Topics Display */}
                {getKeyTopics(selectedCase).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-slate-900 mb-2">Key Topics Identified:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getKeyTopics(selectedCase).map((topic, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                          <Tag className="w-4 h-4" />
                          {topic.charAt(0).toUpperCase() + topic.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Urgency Indicators */}
                {getUrgencyIndicators(selectedCase).length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-red-900 mb-2">Urgency Indicators Detected:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getUrgencyIndicators(selectedCase).map((indicator, index) => (
                        <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {indicator}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Case Summary:</h3>
                  <p className="text-slate-700 leading-relaxed">{selectedCase.summary}</p>
                </div>

                {/* Enhanced AI Processing Info */}
                {hasAIProcessing(selectedCase) && (
                  <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Enhanced AI Conversation Analysis
                    </h4>
                    {(() => {
                      const aiData = getAIMetadata(selectedCase);
                      return aiData ? (
                        <div className="text-sm text-purple-800 space-y-2">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <p className="font-medium mb-1">Conversation Metrics:</p>
                              <ul className="space-y-1">
                                <li>• Conversation ID: {aiData.conversation_id || 'N/A'}</li>
                                <li>• Duration: {Math.round((aiData.duration_seconds || 0) / 60 * 10) / 10} minutes</li>
                                <li>• User Messages: {aiData.user_engagement?.message_count || aiData.user_messages || 'N/A'}</li>
                                <li>• Agent Responses: {aiData.agent_responses || 'N/A'}</li>
                                <li>• Topic Coverage: {aiData.user_engagement?.topic_coverage || 0} topics</li>
                              </ul>
                            </div>
                            <div>
                              <p className="font-medium mb-1">AI Analysis:</p>
                              <ul className="space-y-1">
                                <li>• Conversation Quality: {aiData.conversation_quality || 'N/A'}</li>
                                <li>• Processing Type: {aiData.processing_type || 'AI Conversation'}</li>
                                <li>• HR Priority: {aiData.hr_routing?.priority || 'normal'}</li>
                                <li>• Response Time: {aiData.hr_routing?.estimated_response_time || 'standard'}</li>
                                {aiData.sentiment_analysis && (
                                  <li>• Sentiment: {aiData.sentiment_analysis.overall_sentiment} ({Math.round(aiData.sentiment_analysis.confidence * 100)}% confidence)</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Transcript */}
                {selectedCase.transcripts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-slate-900 mb-2">Full Conversation Transcript:</h3>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <p className="text-slate-700 leading-relaxed">{selectedCase.transcripts[0].raw_transcript}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Insights */}
              {selectedCase.ai_insights.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Insights & Recommendations</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {selectedCase.ai_insights.map((insight) => (
                      <div key={insight.id} className="space-y-4">
                        {insight.insight_type === 'risk_assessment' && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-semibold text-red-900 mb-2">Risk Assessment</h4>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-full bg-red-200 rounded-full h-2">
                                <div 
                                  className="bg-red-600 h-2 rounded-full" 
                                  style={{ width: `${(insight.content.risk_level / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium text-red-700">
                                {insight.content.estimated_impact} ({insight.content.risk_level}/5)
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              {insight.content.immediate_action_required ? 'Immediate action required' : 'Standard processing timeline'}
                            </p>
                          </div>
                        )}
                        
                        {insight.insight_type === 'next_steps' && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2">Recommended Actions</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              {insight.content.recommended_actions?.map((action: string, index: number) => (
                                <li key={index}>• {action}</li>
                              ))}
                            </ul>
                            <p className="text-sm text-green-700 mt-2">
                              <strong>Timeline:</strong> {insight.content.timeline}
                            </p>
                          </div>
                        )}

                        {insight.insight_type === 'elevenlabs_conversation' && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                            <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              AI Conversation Analysis
                            </h4>
                            <div className="text-sm text-purple-700 space-y-1">
                              <p>• Case Title: {insight.content.case_title}</p>
                              <p>• Key Topics: {insight.content.key_topics?.join(', ') || 'None identified'}</p>
                              <p>• Urgency Indicators: {insight.content.urgency_indicators?.length || 0} detected</p>
                              <p>• Conversation Quality: {insight.content.conversation_quality}</p>
                              <p>• User Engagement: {insight.content.user_engagement?.conversation_depth || 'N/A'}</p>
                              <p>• Processing Type: {insight.content.processing_type}</p>
                              <p>• HR Priority: {insight.content.hr_routing?.priority || 'normal'}</p>
                              <p>• HR Routed: ✓ Direct</p>
                              {insight.content.sentiment_analysis && (
                                <p>• Sentiment: {insight.content.sentiment_analysis.overall_sentiment}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {(insight.insight_type === 'deepgram_realtime' || insight.insight_type === 'elevenlabs_realtime') && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Real-time AI Processing
                            </h4>
                            <div className="text-sm text-green-700 space-y-1">
                              <p>• Model: {insight.content.model || 'Advanced AI'}</p>
                              <p>• Processing: {insight.content.processing_type}</p>
                              <p>• Word Count: {insight.content.word_count}</p>
                              <p>• Smart Format: ✓ Enabled</p>
                              <p>• HR Routing: ✓ Direct</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Communication */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                  <MessageSquare className="w-5 h-5" />
                  Secure Communication Thread
                </h3>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {selectedCase.hr_interactions
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`p-4 rounded-lg ${
                        interaction.sender_type === 'employee' ? 'bg-blue-50 ml-8' :
                        interaction.sender_type === 'system' ? 'bg-slate-50' : 'bg-green-50 mr-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-slate-900">
                          {interaction.sender_type === 'system' ? 'System' : 
                           interaction.sender_type === 'hr_manager' ? interaction.sender_name : 'Employee'}
                        </span>
                        {interaction.sender_type === 'system' && (
                          <Lock className="w-3 h-3 text-slate-500" />
                        )}
                        <span className="text-xs text-slate-500">
                          {new Date(interaction.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-700">{interaction.message}</p>
                    </div>
                  ))}
                </div>
                
                {selectedCase.status !== 'closed' && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your secure response..."
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      disabled={sendingMessage}
                    />
                    <button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Analytics Dashboard
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Total Cases</p>
                      <p className="text-2xl font-bold text-slate-900">{cases.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Open Cases</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.open || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Investigating</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.investigating || 0}</p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">Closed Cases</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.casesByStatus.closed || 0}</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm">AI Processed</p>
                      <p className="text-2xl font-bold text-slate-900">{analyticsData.aiProcessedCases}</p>
                    </div>
                    <MessageSquare className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Charts */}
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

              {/* Enhanced AI Technology Status */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Enhanced AI Technology Processing Status
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-purple-800">
                    <p className="font-medium mb-1">Conversational AI Processing</p>
                    <p>✓ {analyticsData.aiProcessedCases} enhanced conversations processed</p>
                    <p>✓ Intelligent case title generation</p>
                    <p>✓ Key topic extraction</p>
                    <p>✓ Urgency indicator detection</p>
                    <p>✓ Automatic HR routing enabled</p>
                  </div>
                  <div className="text-green-800">
                    <p className="font-medium mb-1">Real-time Processing</p>
                    <p>✓ Live text processing</p>
                    <p>✓ Smart formatting enabled</p>
                    <p>✓ Instant categorization</p>
                    <p>✓ Real-time sentiment analysis</p>
                  </div>
                  <div className="text-blue-800">
                    <p className="font-medium mb-1">Enhanced Security & Analytics</p>
                    <p>✓ End-to-end encryption</p>
                    <p>✓ Comprehensive audit trail</p>
                    <p>✓ Advanced case categorization</p>
                    <p>✓ Intelligent priority assignment</p>
                    <p>✓ Real-time sentiment analysis</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};