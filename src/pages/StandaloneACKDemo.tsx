import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Zap, MessageSquare, Settings, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { StandaloneACKDemo } from '../components/StandaloneACKDemo';

export const StandaloneACKDemoPage: React.FC = () => {
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
            Standalone ElevenLabs ACK Generation System
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Direct integration with ElevenLabs for real-time acknowledgment number generation 
            without N8N dependency. Features intelligent trigger detection, conversation monitoring, 
            and comprehensive audit trails.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No N8N Required</h3>
            <p className="text-slate-600 text-sm">
              Direct integration eliminates the need for N8N workflows, reducing complexity and dependencies.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time Processing</h3>
            <p className="text-slate-600 text-sm">
              Instant ACK generation with multiple trigger types including keywords, time-based, and manual.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Intelligent Monitoring</h3>
            <p className="text-slate-600 text-sm">
              Advanced conversation state management with automatic cleanup and comprehensive statistics.
            </p>
          </div>
        </div>

        {/* Main Demo Component */}
        <StandaloneACKDemo className="mb-8" />

        {/* Implementation Guide */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              Quick Setup Guide
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-medium text-slate-900">1. Install Dependencies:</h4>
                <div className="bg-slate-50 rounded p-2 mt-1 font-mono text-xs">
                  npm install express cors crypto
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">2. Environment Variables:</h4>
                <div className="bg-slate-50 rounded p-2 mt-1 font-mono text-xs">
                  ELEVENLABS_API_KEY=sk_your_key<br/>
                  ELEVENLABS_AGENT_ID=agent_id<br/>
                  ACK_TIME_INTERVAL_MINUTES=5
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">3. Initialize System:</h4>
                <div className="bg-slate-50 rounded p-2 mt-1 font-mono text-xs">
{`const generator = createStandaloneACKGenerator({
  apiKey: process.env.ELEVENLABS_API_KEY,
  agentId: process.env.ELEVENLABS_AGENT_ID,
  enableTimeBasedACK: true,
  timeIntervalMinutes: 5
});`}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-green-600" />
              Trigger Types
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <h4 className="font-medium text-slate-900">Keyword Triggers:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>"confirmation number", "reference code"</li>
                  <li>"receipt number", "acknowledgment"</li>
                  <li>Custom keywords: "backfeed", "employee feedback"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Time-based Triggers:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Automatic ACK every X minutes</li>
                  <li>Configurable interval (default: 5 minutes)</li>
                  <li>Only for active conversations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-slate-900">Event Triggers:</h4>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>Conversation start/end events</li>
                  <li>Manual admin triggers</li>
                  <li>Custom business logic triggers</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Integration Examples */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">API Integration Examples</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Express.js Integration</h4>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-xs">
{`// server.js
const express = require('express');
const { createStandaloneACKWebhookHandler } = require('./ack-generator');

const app = express();
app.use(express.json());

const ackHandler = createStandaloneACKWebhookHandler({
  apiKey: process.env.ELEVENLABS_API_KEY,
  agentId: process.env.ELEVENLABS_AGENT_ID,
  enableTimeBasedACK: true,
  timeIntervalMinutes: 5
});

// Webhook endpoint for ElevenLabs
app.post('/webhook/elevenlabs', async (req, res) => {
  const result = await ackHandler.handleConversationWebhook(req.body);
  res.json(result);
});

// Manual ACK generation
app.post('/api/ack/manual', async (req, res) => {
  const result = await ackHandler.handleManualACKRequest(req.body);
  res.json(result);
});

// Statistics endpoint
app.get('/api/ack/stats', (req, res) => {
  res.json(ackHandler.getStats());
});

app.listen(3001, () => {
  console.log('ACK Generator running on port 3001');
});`}
                </pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">React Integration</h4>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-xs">
{`// useACKGenerator.js
import { useState, useEffect } from 'react';

export const useACKGenerator = (config) => {
  const [ackGenerator, setAckGenerator] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const generator = createStandaloneACKGenerator(config);
    setAckGenerator(generator);

    const interval = setInterval(() => {
      setStats(generator.getStats());
    }, 5000);

    return () => {
      clearInterval(interval);
      generator.stop();
    };
  }, [config]);

  const generateManualACK = async (conversationId) => {
    if (!ackGenerator) return null;
    return await ackGenerator.generateManualACK(conversationId);
  };

  return { ackGenerator, stats, generateManualACK };
};`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Deployment Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Deployment Options</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Standalone Server</h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• Dedicated Node.js server</p>
                <p>• Express.js API endpoints</p>
                <p>• Direct ElevenLabs integration</p>
                <p>• Database logging</p>
                <div className="bg-white rounded p-2 mt-2 font-mono text-xs">
                  npm start
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">Docker Container</h4>
              <div className="text-sm text-green-800 space-y-2">
                <p>• Containerized deployment</p>
                <p>• Easy scaling and management</p>
                <p>• Environment isolation</p>
                <p>• Production-ready</p>
                <div className="bg-white rounded p-2 mt-2 font-mono text-xs">
                  docker-compose up
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">Serverless Function</h4>
              <div className="text-sm text-purple-800 space-y-2">
                <p>• AWS Lambda / Vercel</p>
                <p>• Event-driven execution</p>
                <p>• Auto-scaling</p>
                <p>• Cost-effective</p>
                <div className="bg-white rounded p-2 mt-2 font-mono text-xs">
                  vercel deploy
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Monitoring and Analytics */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Monitoring & Analytics Features</h3>
          
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Real-time Metrics:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Total conversations tracked</li>
                <li>• Active conversation count</li>
                <li>• ACK generation success rate</li>
                <li>• Average ACKs per conversation</li>
                <li>• Trigger type distribution</li>
                <li>• Response time monitoring</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Audit & Compliance:</h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Comprehensive generation logs</li>
                <li>• Database audit trails</li>
                <li>• Error tracking and reporting</li>
                <li>• Performance analytics</li>
                <li>• Conversation state history</li>
                <li>• Compliance reporting</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://docs.elevenlabs.io/api-reference/conversational-ai"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ElevenLabs Conversational AI Docs
            </a>
            <a
              href="https://docs.elevenlabs.io/api-reference/text-to-speech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              ElevenLabs TTS API Docs
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};