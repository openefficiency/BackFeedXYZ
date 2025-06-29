import React, { useState } from 'react';
import { ArrowRight, Clock, CheckCircle, AlertCircle, MessageSquare, ArrowLeft, Copy, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../lib/supabase';

interface CaseData {
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

export const TrackCase: React.FC = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const searchCase = async () => {
    if (!confirmationCode.trim()) {
      setError('Please enter a confirmation code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await dbService.getCaseByCode(confirmationCode);
      setCaseData(data);
    } catch (err: any) {
      setError('Case not found. Please check your confirmation code and try again.');
      setCaseData(null);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !caseData || sendingMessage) return;

    setSendingMessage(true);
    try {
      await dbService.addInteraction(caseData.id, newMessage, 'employee');
      
      // Refresh case data to show new message
      const updatedData = await dbService.getCaseByCode(confirmationCode);
      setCaseData(updatedData);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const populateDemoCode = (code: string) => {
    setConfirmationCode(code);
    setError('');
    setCaseData(null);
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const demoCodes = ['AB7X9K2M4P', 'CD8Y5N3Q1R', 'EF9Z6P4S2T', 'GH1A7R5U3V'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-4 px-4">
      <div className="max-w-lg md:max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-6 md:p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-light text-slate-900 mb-4 tracking-tight">
              Track Your Case
            </h1>
            <p className="text-slate-600 font-light leading-relaxed">
              Enter your confirmation code to view status and communicate with HR.
            </p>
          </div>

          {/* Search Form - Mobile First */}
          <div className="mb-8">
            <div className="space-y-4">
              <div>
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-slate-700 mb-3">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  placeholder="Enter your 10-digit code"
                  className="w-full px-6 py-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg text-center tracking-widest"
                  maxLength={10}
                />
              </div>
              <button
                onClick={searchCase}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {loading ? 'Searching...' : 'Track Case'}
              </button>
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Case Details */}
          {caseData && (
            <div className="space-y-6">
              {/* Case Header - Mobile Optimized */}
              <div className="bg-slate-50/80 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">
                    Case #{caseData.confirmation_code}
                  </h2>
                  <p className="text-slate-600">{caseData.category}</p>
                </div>
                
                <div className="flex justify-center gap-3 mb-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
                    {getStatusIcon(caseData.status)}
                    {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
                  </span>
                  <span className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${getSeverityColor(caseData.severity)}`}>
                    Priority: {caseData.severity}/5
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-slate-600 text-center">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(caseData.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Update:</span> {formatDate(caseData.updated_at)}
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-slate-900 mb-3 text-center">Summary:</h3>
                  <p className="text-slate-700 leading-relaxed text-center">{caseData.summary}</p>
                </div>
              </div>

              {/* Messages - Chat Style */}
              <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl p-6">
                <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900 mb-6">
                  <MessageSquare className="w-5 h-5" />
                  Communication
                </h3>
                
                <div className="space-y-4 mb-6 max-h-80 overflow-y-auto">
                  {caseData.hr_interactions
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`flex ${interaction.sender_type === 'employee' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-2xl ${
                          interaction.sender_type === 'employee'
                            ? 'bg-blue-600 text-white'
                            : interaction.sender_type === 'system'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{interaction.message}</p>
                        <p className={`text-xs mt-2 ${
                          interaction.sender_type === 'employee' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {interaction.sender_type === 'system' ? 'System' : 
                           interaction.sender_type === 'hr_manager' ? interaction.sender_name : 'You'} • 
                          {new Date(interaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                {caseData.status !== 'closed' && (
                  <div className="space-y-3">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                      disabled={sendingMessage}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {sendingMessage ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Demo Codes - Mobile Optimized */}
          <div className="mt-8 bg-blue-50/80 border border-blue-200/50 rounded-2xl p-6">
            <p className="text-blue-700 text-sm mb-4 text-center font-medium">
              💡 Try Demo Cases
            </p>
            <div className="grid grid-cols-2 gap-3">
              {demoCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => populateDemoCode(code)}
                  className="flex items-center justify-center p-3 bg-white/80 border border-blue-200 rounded-xl hover:bg-white transition-colors group"
                >
                  <span className="font-mono text-sm font-medium text-blue-800">{code}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-3 text-center">
              Tap any code to try the tracking feature
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};