import React, { useState } from 'react';
import { Search, Clock, CheckCircle, AlertCircle, MessageSquare, ArrowLeft, Copy } from 'lucide-react';
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
  const [copiedCode, setCopiedCode] = useState('');

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

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(''), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const populateDemoCode = (code: string) => {
    // Only populate the text field, don't trigger search
    setConfirmationCode(code);
    
    // Clear any existing error
    setError('');
    
    // Clear any existing case data
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
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
              Track Your Case
            </h1>
            <p className="text-slate-600">
              Enter your confirmation code to view the status of your feedback and 
              communicate with the HR team.
            </p>
          </div>

          {/* Search Form */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="confirmationCode" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmation Code
                </label>
                <input
                  type="text"
                  id="confirmationCode"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                  placeholder="Enter your 10-digit code (e.g., AB7X9K2M4P)"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-lg"
                  maxLength={10}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={searchCase}
                  disabled={loading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  Search
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Case Details */}
          {caseData && (
            <div className="space-y-6">
              {/* Case Header */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Case #{caseData.confirmation_code}
                    </h2>
                    <p className="text-slate-600">Category: {caseData.category}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(caseData.status)}`}>
                      {getStatusIcon(caseData.status)}
                      {caseData.status.charAt(0).toUpperCase() + caseData.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(caseData.severity)}`}>
                      Priority: {caseData.severity}/5
                    </span>
                  </div>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-medium">Created:</span> {formatDate(caseData.created_at)}
                  </div>
                  <div>
                    <span className="font-medium">Last Update:</span> {formatDate(caseData.updated_at)}
                  </div>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium text-slate-900 mb-2">Summary:</h3>
                  <p className="text-slate-700">{caseData.summary}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                  <MessageSquare className="w-5 h-5" />
                  Communication History
                </h3>
                
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {caseData.hr_interactions
                    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
                    .map((interaction) => (
                    <div
                      key={interaction.id}
                      className={`flex ${interaction.sender_type === 'employee' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          interaction.sender_type === 'employee'
                            ? 'bg-blue-600 text-white'
                            : interaction.sender_type === 'system'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <p className="text-sm">{interaction.message}</p>
                        <p className={`text-xs mt-2 ${
                          interaction.sender_type === 'employee' ? 'text-blue-100' : 'text-slate-500'
                        }`}>
                          {interaction.sender_type === 'system' ? 'System' : 
                           interaction.sender_type === 'hr_manager' ? interaction.sender_name : 'You'} • {formatDate(interaction.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
                {caseData.status !== 'closed' && (
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
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
          )}

          {/* Demo Codes Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm mb-4">
              💡 Try use Demo Case numbers to explore the follow-up functionality of employees
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {demoCodes.map((code) => (
                <button
                  key={code}
                  onClick={() => populateDemoCode(code)}
                  className="flex items-center justify-between p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
                >
                  <span className="font-mono text-sm font-medium text-blue-800">{code}</span>
                  <div className="flex items-center">
                    <Copy className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Click any code to populate the confirmation code field, then click Search
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};