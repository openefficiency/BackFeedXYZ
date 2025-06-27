import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Zap, MessageSquare, Webhook, Settings, ExternalLink, AlertCircle } from 'lucide-react';
import { ACKGeneratorDemo } from '../components/ACKGeneratorDemo';

export const ACKDemo: React.FC = () => {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            ElevenLabs ACK Number Generation System
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Real-time acknowledgment number generation and injection into live phone calls 
            using ElevenLabs TTS with comprehensive N8N workflow integration for automated triggers.
          </p>
        </div>

        {/* Production Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h3 className="font-semibold text-amber-900">Production Implementation Notice</h3>
          </div>
          <p className="text-amber-800 text-sm">
            This is a demonstration of the ACK generation system. In a production environment, 
            you would need valid ElevenLabs API credentials and active phone call IDs. 
            The demo shows the workflow and interface without making actual API calls.
          </p>
        </div>

        {/* Main Demo Component */}
        <ACKGeneratorDemo className="mb-8" />

        {/* Architecture Overview */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              ElevenLabs Call Integration
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-medium text-slate-900">Voice Optimization:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Stability: 0.8 (higher for number clarity)</li>
                  <li>Similarity Boost: 0.7 (clear pronunciation)</li>
                  <li>Style: 0.1 (neutral tone for numbers)</li>
                  <li>Speaker Boost: Enabled for call quality</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Message Formats:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Initial clear announcement with full number</li>
                  <li>Grouped format (XXX-XXX-XXXX) for memorization</li>
                  <li>Slow digit-by-digit spelling with pauses</li>
                  <li>Final confirmation for verification</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Injection Process:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Real-time TTS generation</li>
                  <li>Sequential message injection with delays</li>
                  <li>Retry logic for failed injections</li>
                  <li>Comprehensive result tracking</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Webhook className="w-5 h-5 text-purple-600" />
              N8N Workflow Integration
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-medium text-slate-900">Trigger Types:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><strong>Keyword:</strong> "I need a confirmation number"</li>
                  <li><strong>Time-based:</strong> After X minutes of call</li>
                  <li><strong>Event-based:</strong> Transaction completion</li>
                  <li><strong>Manual:</strong> Agent-triggered generation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Webhook Configuration:</h4>
                <div className="bg-slate-50 rounded p-3 mt-1">
                  <code className="text-xs">
                    POST /api/ack/generate<br/>
                    Content-Type: application/json<br/>
                    Authorization: Bearer [token]
                  </code>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Response Handling:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Success/failure status tracking</li>
                  <li>Callback URL support for N8N</li>
                  <li>Comprehensive error reporting</li>
                  <li>Workflow ID for audit trails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* N8N Workflow Examples */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-green-600" />
            N8N Workflow Examples
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Keyword-Triggered Workflow</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <div className="bg-white rounded p-2">
                  <strong>1. Speech Recognition Node</strong><br/>
                  Listens for: "confirmation", "reference", "number"
                </div>
                <div className="bg-white rounded p-2">
                  <strong>2. HTTP Request Node</strong><br/>
                  POST to ACK generation endpoint
                </div>
                <div className="bg-white rounded p-2">
                  <strong>3. ElevenLabs Injection</strong><br/>
                  Inject ACK into active call
                </div>
                <div className="bg-white rounded p-2">
                  <strong>4. Database Log</strong><br/>
                  Store ACK and call details
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Time-Based Workflow</h4>
              <div className="text-sm text-purple-800 space-y-2">
                <div className="bg-white rounded p-2">
                  <strong>1. Timer Node</strong><br/>
                  Trigger after 5 minutes of call
                </div>
                <div className="bg-white rounded p-2">
                  <strong>2. Call Status Check</strong><br/>
                  Verify call is still active
                </div>
                <div className="bg-white rounded p-2">
                  <strong>3. ACK Generation</strong><br/>
                  Generate and inject number
                </div>
                <div className="bg-white rounded p-2">
                  <strong>4. Customer Notification</strong><br/>
                  Send SMS/email with ACK
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Implementation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Technical Implementation Details</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Real-time Processing
              </h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• WebSocket connections for live audio</li>
                <li>• Sub-second TTS generation</li>
                <li>• Immediate call injection</li>
                <li>• Real-time status monitoring</li>
                <li>• Automatic retry mechanisms</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Audio Quality
              </h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• Optimized voice settings for numbers</li>
                <li>• Multiple pronunciation formats</li>
                <li>• Clear digit separation</li>
                <li>• Appropriate speaking pace</li>
                <li>• Background noise handling</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-green-600" />
                Integration Features
              </h4>
              <ul className="text-sm text-slate-700 space-y-2">
                <li>• RESTful API endpoints</li>
                <li>• Webhook callback support</li>
                <li>• Database logging and audit</li>
                <li>• Error handling and recovery</li>
                <li>• Scalable architecture</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Code Example */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Implementation Code Example</h3>
          
          <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-green-400 text-sm">
{`// ElevenLabs ACK Generation Example
import { createACKGenerator } from './elevenlabs-ack';

const config = {
  voiceId: 'EXAVITQu4vr4xnSDxMaL',
  callId: 'call_123456789',
  apiKey: process.env.ELEVENLABS_API_KEY,
  voiceSettings: {
    stability: 0.8,
    similarity_boost: 0.7,
    style: 0.1,
    use_speaker_boost: true
  }
};

// Generate and inject ACK number
const generator = createACKGenerator(config);
const ackNumber = generator.generateACKNumber();
const result = await generator.injectACKIntoCall(ackNumber);

console.log('ACK injected:', result.ackNumber);
console.log('Status:', result.status);
console.log('Injection results:', result.injectionResults);`}
            </pre>
          </div>
        </div>

        {/* API Reference */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-6">
          <h3 className="font-semibold text-slate-900 mb-4">API Reference & Documentation</h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-slate-900 mb-2">Required Environment Variables:</h4>
              <div className="bg-slate-100 rounded p-3 font-mono text-xs space-y-1">
                <div>ELEVENLABS_API_KEY=sk_...</div>
                <div>DEFAULT_VOICE_ID=EXAVITQu4vr4xnSDxMaL</div>
                <div>N8N_WEBHOOK_SECRET=webhook_secret</div>
                <div>DATABASE_URL=postgresql://...</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-900 mb-2">API Endpoints Used:</h4>
              <div className="bg-slate-100 rounded p-3 font-mono text-xs space-y-1">
                <div>POST /v1/text-to-speech/{voice_id}/stream</div>
                <div>POST /v1/phone-calls/{call_id}/inject-message</div>
                <div>WSS /v1/text-to-speech/{voice_id}/stream-input</div>
                <div>GET /v1/voices/{voice_id}</div>
                <div>GET /v1/phone-calls/{call_id}</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://docs.elevenlabs.io/api-reference/phone-calls"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ElevenLabs Phone API Docs
            </a>
            <a
              href="https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              N8N Webhook Docs
            </a>
            <a
              href="https://github.com/elevenlabs/elevenlabs-js"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ElevenLabs JS SDK
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};