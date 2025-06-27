import React, { useState } from 'react';
import { Phone, Hash, Play, Copy, CheckCircle, AlertCircle, Zap, Clock, Settings, Webhook, ExternalLink } from 'lucide-react';
import { ElevenLabsACKGenerator, createACKGenerator, N8NACKWebhookHandler, createN8NACKHandler } from '../lib/elevenlabs-ack';

interface ACKGeneratorDemoProps {
  className?: string;
}

export const ACKGeneratorDemo: React.FC<ACKGeneratorDemoProps> = ({ className = '' }) => {
  const [ackNumber, setAckNumber] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'playing' | 'injecting' | 'error'>('idle');
  const [error, setError] = useState('');
  const [currentAudioIndex, setCurrentAudioIndex] = useState(0);
  const [injectionResults, setInjectionResults] = useState<any[]>([]);
  const [callId, setCallId] = useState('demo_call_123');
  const [voiceId, setVoiceId] = useState('EXAVITQu4vr4xnSDxMaL');
  const [apiKey, setApiKey] = useState('demo_key');

  // Demo configuration
  const getDemoConfig = () => ({
    voiceId,
    callId,
    apiKey,
    voiceSettings: {
      stability: 0.8,
      similarity_boost: 0.7,
      style: 0.1,
      use_speaker_boost: true
    }
  });

  const generateACK = async () => {
    setIsGenerating(true);
    setStatus('generating');
    setError('');
    setInjectionResults([]);

    try {
      // Create ACK generator instance
      const generator = createACKGenerator(getDemoConfig());
      
      // Generate ACK number
      const newAckNumber = generator.generateACKNumber();
      setAckNumber(newAckNumber);

      // For demo purposes, simulate audio generation
      setStatus('ready');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate audio URLs (in production, these would be real audio)
      const mockAudioUrls = [
        'demo_audio_1.mp3',
        'demo_audio_2.mp3',
        'demo_audio_3.mp3',
        'demo_audio_4.mp3'
      ];
      
      setAudioUrls(mockAudioUrls);
      setStatus('ready');

    } catch (err: any) {
      setError(`Failed to generate ACK: ${err.message}`);
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const injectIntoCall = async () => {
    if (!ackNumber) return;
    
    setStatus('injecting');
    setError('');

    try {
      const generator = createACKGenerator(getDemoConfig());
      
      // For demo purposes, simulate the injection process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate injection results
      const mockResults = [
        { messageIndex: 0, success: true, timestamp: new Date().toISOString() },
        { messageIndex: 1, success: true, timestamp: new Date(Date.now() + 3000).toISOString() },
        { messageIndex: 2, success: true, timestamp: new Date(Date.now() + 5000).toISOString() },
        { messageIndex: 3, success: Math.random() > 0.2, timestamp: new Date(Date.now() + 7000).toISOString(), error: Math.random() > 0.2 ? undefined : 'Network timeout' }
      ];
      
      setInjectionResults(mockResults);
      setStatus('ready');

    } catch (err: any) {
      setError(`Failed to inject ACK: ${err.message}`);
      setStatus('error');
    }
  };

  const testN8NWebhook = async () => {
    setStatus('generating');
    setError('');

    try {
      // Create N8N webhook handler
      const handler = createN8NACKHandler(getDemoConfig());
      
      // Simulate N8N webhook payload
      const webhookPayload = {
        trigger_type: 'manual' as const,
        call_id: callId,
        voice_id: voiceId,
        user_id: 'demo_user_123',
        session_data: {
          customer_id: 'cust_456',
          transaction_id: 'txn_789'
        },
        callback_url: 'https://n8n.example.com/webhook/ack-callback'
      };

      // Process webhook
      const result = await handler.handleWebhook(webhookPayload);
      
      setAckNumber(result.ackNumber);
      setInjectionResults(result.injectionResults || []);
      setStatus('ready');

    } catch (err: any) {
      setError(`N8N webhook test failed: ${err.message}`);
      setStatus('error');
    }
  };

  const playAudio = async (index: number) => {
    setCurrentAudioIndex(index);
    setStatus('playing');
    
    // Simulate audio playback
    await new Promise(resolve => setTimeout(resolve, 3000));
    setStatus('ready');
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
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'playing': return <Play className="w-5 h-5 text-purple-600 animate-pulse" />;
      case 'injecting': return <Zap className="w-5 h-5 text-orange-600 animate-pulse" />;
      case 'error': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return <Hash className="w-5 h-5 text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generating': return 'Generating ACK number...';
      case 'ready': return 'ACK ready for injection';
      case 'playing': return 'Playing audio...';
      case 'injecting': return 'Injecting into call...';
      case 'error': return 'Operation failed';
      default: return 'Ready to generate';
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">
            ElevenLabs ACK Generator
          </h3>
        </div>
        <p className="text-slate-600">
          Generate and inject acknowledgment numbers into live phone calls using ElevenLabs TTS
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="font-medium text-slate-900">Configuration</h4>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <label className="block text-slate-700 mb-1">Call ID:</label>
            <input
              type="text"
              value={callId}
              onChange={(e) => setCallId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              placeholder="call_123456"
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1">Voice ID:</label>
            <input
              type="text"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs font-mono"
              placeholder="EXAVITQu4vr4xnSDxMaL"
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

      {/* Generation Controls */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={generateACK}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Generate ACK
            </>
          )}
        </button>

        {ackNumber && (
          <button
            onClick={injectIntoCall}
            disabled={status === 'injecting'}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {status === 'injecting' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Injecting...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5" />
                Inject into Call
              </>
            )}
          </button>
        )}

        <button
          onClick={testN8NWebhook}
          disabled={isGenerating}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <Webhook className="w-5 h-5" />
          Test N8N Webhook
        </button>
      </div>

      {/* Audio Playback Controls */}
      {audioUrls.length > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-purple-900 mb-3">Audio Messages for Call Injection:</h4>
          <div className="space-y-2">
            {[
              'Initial clear announcement',
              'Grouped format repetition',
              'Slow digit-by-digit spelling',
              'Final confirmation'
            ].map((label, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm text-slate-700">{label}</span>
                <button
                  onClick={() => playAudio(index)}
                  disabled={status === 'playing'}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  {status === 'playing' && currentAudioIndex === index ? 'Playing...' : 'Play'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Injection Results */}
      {injectionResults.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-3">Call Injection Results:</h4>
          <div className="space-y-2">
            {injectionResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                <span className="text-sm text-slate-700">Message {result.messageIndex + 1}</span>
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                    {result.success ? 'Success' : result.error || 'Failed'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-sm text-green-700">
            Success Rate: {Math.round((injectionResults.filter(r => r.success).length / injectionResults.length) * 100)}%
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

      {/* N8N Integration Guide */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
          <Webhook className="w-4 h-4" />
          N8N Webhook Integration
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-purple-800">
          <div>
            <p className="font-medium mb-1">Webhook Endpoint:</p>
            <code className="bg-purple-100 px-2 py-1 rounded text-xs">
              POST /api/ack/generate
            </code>
            <p className="font-medium mb-1 mt-2">Required Payload:</p>
            <pre className="bg-purple-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "trigger_type": "keyword",
  "call_id": "call_123",
  "voice_id": "voice_456",
  "user_id": "user_789"
}`}
            </pre>
          </div>
          <div>
            <p className="font-medium mb-1">Trigger Types:</p>
            <ul className="space-y-1">
              <li>• <code>keyword</code> - Voice command detected</li>
              <li>• <code>time</code> - Timer-based trigger</li>
              <li>• <code>event</code> - System event trigger</li>
              <li>• <code>manual</code> - Manual activation</li>
            </ul>
            <p className="font-medium mb-1 mt-2">Response Format:</p>
            <pre className="bg-purple-100 p-2 rounded text-xs overflow-x-auto">
{`{
  "success": true,
  "ackNumber": "1234567890",
  "callId": "call_123",
  "workflow_id": "wf_456"
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* Implementation Details */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Implementation Features:</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">ElevenLabs Integration:</p>
            <ul className="space-y-1">
              <li>• Real-time TTS generation</li>
              <li>• Optimized voice settings for numbers</li>
              <li>• Multiple message formats</li>
              <li>• Call injection with retry logic</li>
              <li>• WebSocket streaming support</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">N8N Workflow Features:</p>
            <ul className="space-y-1">
              <li>• Webhook trigger support</li>
              <li>• Multiple trigger types</li>
              <li>• Comprehensive logging</li>
              <li>• Error handling and callbacks</li>
              <li>• Database integration</li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Documentation Link */}
      <div className="mt-4 text-center">
        <a
          href="https://docs.elevenlabs.io/api-reference/phone-calls"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ExternalLink className="w-4 h-4" />
          ElevenLabs Phone Calls API Documentation
        </a>
      </div>
    </div>
  );
};