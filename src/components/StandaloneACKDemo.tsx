import React, { useState, useEffect } from 'react';
import { Phone, Hash, Play, Copy, CheckCircle, AlertCircle, Zap, Clock, Settings, MessageSquare, BarChart3, Users } from 'lucide-react';
import { StandaloneACKGenerator, createStandaloneACKGenerator, StandaloneACKWebhookHandler, createStandaloneACKWebhookHandler } from '../lib/standalone-ack-generator';

interface StandaloneACKDemoProps {
  className?: string;
}

export const StandaloneACKDemo: React.FC<StandaloneACKDemoProps> = ({ className = '' }) => {
  const [ackNumber, setAckNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'processing' | 'error'>('idle');
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState('conv_demo_123');
  const [apiKey, setApiKey] = useState('demo_api_key');
  const [agentId, setAgentId] = useState('agent_01jydtj6avef99c1ne0eavf0ww');
  const [triggerType, setTriggerType] = useState<'keyword' | 'time' | 'manual' | 'conversation_end'>('manual');
  const [testMessage, setTestMessage] = useState('I need a confirmation number for my feedback');
  const [ackGenerator, setAckGenerator] = useState<StandaloneACKGenerator | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [generationHistory, setGenerationHistory] = useState<any[]>([]);

  // Initialize ACK generator
  useEffect(() => {
    try {
      const generator = createStandaloneACKGenerator({
        apiKey,
        agentId,
        enableTimeBasedACK: true,
        timeIntervalMinutes: 2, // Shorter for demo
        customKeywords: ['backfeed', 'employee feedback', 'confirmation', 'reference']
      });
      
      setAckGenerator(generator);
      
      // Update stats periodically
      const statsInterval = setInterval(() => {
        setStats(generator.getStats());
      }, 5000);

      return () => {
        clearInterval(statsInterval);
        generator.stop();
      };
    } catch (err: any) {
      setError(`Failed to initialize ACK generator: ${err.message}`);
    }
  }, [apiKey, agentId]);

  const getDemoConfig = () => ({
    apiKey,
    agentId,
    enableTimeBasedACK: true,
    timeIntervalMinutes: 2,
    customKeywords: ['backfeed', 'employee feedback', 'confirmation', 'reference']
  });

  const generateManualACK = async () => {
    if (!ackGenerator) return;
    
    setIsGenerating(true);
    setStatus('generating');
    setError('');

    try {
      const result = await ackGenerator.generateManualACK(conversationId, 'demo_user');
      
      setAckNumber(result.ackNumber);
      setStatus('ready');
      
      // Add to history
      setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
      
    } catch (err: any) {
      setError(`Failed to generate ACK: ${err.message}`);
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const testKeywordTrigger = async () => {
    if (!ackGenerator) return;
    
    setIsGenerating(true);
    setStatus('processing');
    setError('');

    try {
      const result = await ackGenerator.processConversationMessage(
        conversationId,
        testMessage,
        agentId,
        'demo_user'
      );
      
      if (result) {
        setAckNumber(result.ackNumber);
        setStatus('ready');
        setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
      } else {
        setError('No ACK triggers found in the test message');
        setStatus('error');
      }
      
    } catch (err: any) {
      setError(`Failed to test keyword trigger: ${err.message}`);
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const testConversationEnd = async () => {
    if (!ackGenerator) return;
    
    setIsGenerating(true);
    setStatus('processing');
    setError('');

    try {
      const result = await ackGenerator.handleConversationEnd(conversationId, {
        duration: 180000, // 3 minutes
        userMessages: 5,
        agentMessages: 6,
        summary: 'Employee provided feedback about workplace safety concerns'
      });
      
      if (result) {
        setAckNumber(result.ackNumber);
        setStatus('ready');
        setGenerationHistory(prev => [result, ...prev.slice(0, 4)]);
      } else {
        setError('Failed to generate ACK for conversation end');
        setStatus('error');
      }
      
    } catch (err: any) {
      setError(`Failed to test conversation end: ${err.message}`);
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyACK = () => {
    if (ackNumber) {
      navigator.clipboard.writeText(ackNumber);
    }
  };

  const formatACKDisplay = (ack: string) => {
    if (!ack) return '';
    return ack.split('').join(' ');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'generating': return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'processing': return <Zap className="w-5 h-5 text-purple-600 animate-pulse" />;
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Hash className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generating': return 'Generating ACK number...';
      case 'processing': return 'Processing conversation...';
      case 'ready': return 'ACK generated successfully';
      case 'error': return 'Operation failed';
      default: return 'Ready to generate ACK';
    }
  };

  const getTriggerTypeColor = (type: string) => {
    switch (type) {
      case 'keyword': return 'bg-blue-100 text-blue-700';
      case 'time': return 'bg-green-100 text-green-700';
      case 'manual': return 'bg-purple-100 text-purple-700';
      case 'conversation_end': return 'bg-orange-100 text-orange-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">
            Standalone ElevenLabs ACK Generator
          </h3>
        </div>
        <p className="text-slate-600">
          Direct integration with ElevenLabs for real-time ACK generation without N8N dependency
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="font-medium text-slate-900">System Configuration</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-slate-700 mb-1">Conversation ID:</label>
            <input
              type="text"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              placeholder="conv_123456"
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">Agent ID:</label>
            <input
              type="text"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              placeholder="agent_01jydtj6avef99c1ne0eavf0ww"
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">API Key:</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              placeholder="sk_..."
            />
          </div>
        </div>
      </div>

      {/* Status Display */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3 mb-2">
          {getStatusIcon()}
          <span className="font-medium text-slate-900">{getStatusText()}</span>
        </div>
        
        {ackNumber && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Generated ACK Number:</span>
              <button
                onClick={copyACK}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <div className="text-3xl font-mono font-bold text-blue-600 tracking-wider">
              {formatACKDisplay(ackNumber)}
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">Trigger Testing</h4>
          
          <button
            onClick={generateManualACK}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating && triggerType === 'manual' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Manual ACK Generation
              </>
            )}
          </button>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Test Message for Keyword Trigger:</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-sm"
              placeholder="Enter message with ACK keywords..."
            />
            <button
              onClick={testKeywordTrigger}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isGenerating && triggerType === 'keyword' ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Test Keyword Trigger
                </>
              )}
            </button>
          </div>

          <button
            onClick={testConversationEnd}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isGenerating && triggerType === 'conversation_end' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Test Conversation End
              </>
            )}
          </button>
        </div>

        {/* Statistics */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900">System Statistics</h4>
          
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalConversations}</div>
                <div className="text-xs text-blue-700">Total Conversations</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeConversations}</div>
                <div className="text-xs text-green-700">Active Conversations</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalACKsGenerated}</div>
                <div className="text-xs text-purple-700">ACKs Generated</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.averageACKsPerConversation}</div>
                <div className="text-xs text-orange-700">Avg per Conversation</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generation History */}
      {generationHistory.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Recent ACK Generations
          </h4>
          <div className="space-y-2">
            {generationHistory.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-900">{result.ackNumber}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTriggerTypeColor(result.triggerType)}`}>
                    {result.triggerType}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    result.status === 'injected' ? 'bg-green-100 text-green-700' : 
                    result.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {result.status}
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Features Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Standalone System Features:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Direct ElevenLabs Integration:</p>
            <ul className="space-y-1">
              <li>• No N8N dependency required</li>
              <li>• Real-time conversation monitoring</li>
              <li>• Multiple trigger types supported</li>
              <li>• Automatic keyword detection</li>
              <li>• Time-based ACK generation</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Advanced Features:</p>
            <ul className="space-y-1">
              <li>• Conversation state management</li>
              <li>• Comprehensive logging and tracking</li>
              <li>• Database integration for audit trails</li>
              <li>• Configurable trigger keywords</li>
              <li>• Real-time statistics and monitoring</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};