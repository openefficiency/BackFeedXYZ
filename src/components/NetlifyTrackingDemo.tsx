import React, { useState } from 'react';
import { Phone, Hash, Play, Copy, CheckCircle, AlertCircle, Zap, Clock, Settings, MessageSquare, ExternalLink } from 'lucide-react';

interface NetlifyTrackingDemoProps {
  className?: string;
}

export const NetlifyTrackingDemo: React.FC<NetlifyTrackingDemoProps> = ({ className = '' }) => {
  const [conversationId, setConversationId] = useState('demo_conv_123');
  const [testMessage, setTestMessage] = useState('I need a tracking code for my feedback');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const testWebhook = async (eventType: string, customMessage?: string) => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const payload = {
        event_type: eventType,
        conversation_id: conversationId,
        agent_id: 'agent_01jydtj6avef99c1ne0eavf0ww',
        user_message: customMessage || testMessage,
        timestamp: new Date().toISOString(),
        user_id: 'demo_user_123'
      };

      console.log('🧪 Testing webhook with payload:', payload);

      // In production, this would be your deployed Netlify Edge Function URL
      const webhookUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:8888/api/elevenlabs-webhook'
        : '/api/elevenlabs-webhook';

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        console.log('✅ Webhook test successful:', data);
      } else {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

    } catch (err: any) {
      console.error('❌ Webhook test failed:', err);
      setError(err.message || 'Failed to test webhook');
    } finally {
      setLoading(false);
    }
  };

  const copyTrackingCode = () => {
    if (result?.tracking_data?.trackingCode) {
      navigator.clipboard.writeText(result.tracking_data.trackingCode);
    }
  };

  const formatTrackingCode = (code: string) => {
    if (!code) return '';
    // Format as YYMMDD-XXXX for better readability
    return `${code.slice(0, 6)}-${code.slice(6)}`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 p-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Phone className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-slate-900">
            Netlify Edge Function Tracking System
          </h3>
        </div>
        <p className="text-slate-600">
          Direct ElevenLabs webhook integration for real-time tracking code generation
        </p>
      </div>

      {/* Configuration Panel */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-slate-600" />
          <h4 className="font-medium text-slate-900">Test Configuration</h4>
        </div>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
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
            <label className="block text-slate-700 mb-1">Test Message:</label>
            <input
              type="text"
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded text-xs"
              placeholder="I need a tracking code"
            />
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Trigger Tests</h4>
          
          <button
            onClick={() => testWebhook('manual_tracking_request')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Manual Request
              </>
            )}
          </button>

          <button
            onClick={() => testWebhook('conversation.user_message', testMessage)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4" />
            Keyword Trigger
          </button>

          <button
            onClick={() => testWebhook('conversation.ended')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <CheckCircle className="w-4 h-4" />
            Conversation End
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900">Webhook Status</h4>
          
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-900">Edge Function Ready</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Netlify Edge Function deployed</p>
              <p>• Global CDN distribution</p>
              <p>• Real-time webhook processing</p>
              <p>• Automatic tracking code generation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Tracking Code Generated Successfully
          </h4>
          
          {result.tracking_data && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div>
                  <div className="text-2xl font-mono font-bold text-green-600">
                    {formatTrackingCode(result.tracking_data.trackingCode)}
                  </div>
                  <div className="text-sm text-green-700">
                    Trigger: {result.tracking_data.triggerType} • Status: {result.tracking_data.status}
                  </div>
                </div>
                <button
                  onClick={copyTrackingCode}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
              </div>

              {/* Spoken Text Preview */}
              <div className="bg-white rounded border p-3">
                <h5 className="font-medium text-green-900 mb-2">Generated Speech:</h5>
                <div className="space-y-2">
                  {result.tracking_data.spokenText?.map((text: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded text-sm">
                      <Play className="w-3 h-3 text-green-600" />
                      <span className="text-green-800">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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

      {/* Integration Guide */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">ElevenLabs Integration Setup</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <p className="font-medium mb-1">Webhook Configuration:</p>
            <ul className="space-y-1">
              <li>• Go to ElevenLabs Conversational AI settings</li>
              <li>• Add Post-call webhook</li>
              <li>• URL: https://your-site.netlify.app/api/elevenlabs-webhook</li>
              <li>• Copy webhook secret to environment variables</li>
            </ul>
          </div>
          <div>
            <p className="font-medium mb-1">Environment Variables:</p>
            <ul className="space-y-1">
              <li>• ELEVENLABS_API_KEY</li>
              <li>• ELEVENLABS_WEBHOOK_SECRET</li>
              <li>• SUPABASE_URL (optional)</li>
              <li>• SUPABASE_SERVICE_ROLE_KEY (optional)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Trigger Keywords */}
      <div className="bg-slate-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-slate-900 mb-2">Automatic Trigger Keywords</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-slate-700 mb-1">Primary Triggers:</p>
            <ul className="text-slate-600 space-y-1">
              <li>• "tracking code"</li>
              <li>• "confirmation number"</li>
              <li>• "receipt number"</li>
              <li>• "reference number"</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Request Phrases:</p>
            <ul className="text-slate-600 space-y-1">
              <li>• "can I get"</li>
              <li>• "please provide"</li>
              <li>• "I need"</li>
              <li>• "give me"</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-700 mb-1">Completion Words:</p>
            <ul className="text-slate-600 space-y-1">
              <li>• "completed"</li>
              <li>• "finished"</li>
              <li>• "successful"</li>
              <li>• "confirmed"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Deployment Instructions */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 mb-2">Deployment Instructions</h4>
        <div className="text-sm text-green-800 space-y-2">
          <p>1. Push your code to GitHub/GitLab/Bitbucket</p>
          <p>2. Connect repository to Netlify</p>
          <p>3. Set environment variables in Netlify dashboard</p>
          <p>4. Deploy automatically via Git</p>
          <p>5. Configure ElevenLabs webhook with your Netlify URL</p>
        </div>
        
        <div className="mt-4 flex gap-4">
          <a
            href="https://docs.netlify.com/edge-functions/overview/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Netlify Edge Functions Docs
          </a>
          <a
            href="https://docs.elevenlabs.io/api-reference/conversational-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            ElevenLabs Webhook Docs
          </a>
        </div>
      </div>
    </div>
  );
};