import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Globe, Shield, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { NetlifyTrackingDemo } from '../components/NetlifyTrackingDemo';

export const NetlifyTrackingDemoPage: React.FC = () => {
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
            Netlify Edge Function Tracking System
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Direct ElevenLabs webhook integration using Netlify Edge Functions for 
            real-time tracking code generation without external dependencies.
          </p>
        </div>

        {/* Benefits Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Dependencies</h3>
            <p className="text-slate-600 text-sm">
              Direct integration eliminates N8N, Supabase Edge Functions, and other middleware.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Global CDN</h3>
            <p className="text-slate-600 text-sm">
              Edge functions run at 100+ locations worldwide for ultra-low latency.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Instant Response</h3>
            <p className="text-slate-600 text-sm">
              Near-zero cold starts and sub-100ms response times for real-time processing.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure & Scalable</h3>
            <p className="text-slate-600 text-sm">
              Built-in security, automatic scaling, and comprehensive monitoring.
            </p>
          </div>
        </div>

        {/* Main Demo Component */}
        <NetlifyTrackingDemo className="mb-8" />

        {/* Architecture Comparison */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Previous Architecture (Complex)
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>ElevenLabs → N8N Workflow → Supabase Edge Function → Database</span>
              </div>
              <div className="text-red-700 space-y-1">
                <p>❌ Multiple dependencies and failure points</p>
                <p>❌ Complex setup and configuration</p>
                <p>❌ Higher latency due to multiple hops</p>
                <p>❌ More expensive with multiple services</p>
                <p>❌ Harder to debug and monitor</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              New Architecture (Simple)
            </h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>ElevenLabs → Netlify Edge Function → Database (optional)</span>
              </div>
              <div className="text-green-700 space-y-1">
                <p>✅ Single dependency, minimal failure points</p>
                <p>✅ Simple setup with Git-based deployment</p>
                <p>✅ Ultra-low latency with edge computing</p>
                <p>✅ Cost-effective with generous free tier</p>
                <p>✅ Built-in monitoring and debugging</p>
              </div>
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Setup Guide</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">1. Deploy to Netlify</h4>
                <div className="bg-slate-50 rounded p-3 text-sm">
                  <p className="mb-2">Connect your Git repository to Netlify:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Push code to GitHub/GitLab</li>
                    <li>• Connect repo to Netlify</li>
                    <li>• Automatic deployment with netlify.toml</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">2. Set Environment Variables</h4>
                <div className="bg-slate-50 rounded p-3 text-sm font-mono">
                  <p>ELEVENLABS_API_KEY=sk_your_key</p>
                  <p>ELEVENLABS_WEBHOOK_SECRET=whsec_...</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">3. Configure ElevenLabs</h4>
                <div className="bg-slate-50 rounded p-3 text-sm">
                  <p className="mb-2">In ElevenLabs Conversational AI settings:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Add Post-call webhook</li>
                    <li>• URL: https://your-site.netlify.app/api/elevenlabs-webhook</li>
                    <li>• Copy webhook secret</li>
                  </ul>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 mb-2">4. Test Integration</h4>
                <div className="bg-slate-50 rounded p-3 text-sm">
                  <p className="mb-2">Test with your ElevenLabs agent:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>• Say "I need a tracking code"</li>
                    <li>• Agent speaks 10-digit number</li>
                    <li>• Check Netlify function logs</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tracking Code Format */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-4">Tracking Code Format</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Format: YYMMDDXXXX</h4>
              <div className="bg-white rounded p-4 border">
                <div className="text-3xl font-mono font-bold text-blue-600 mb-2">2501274589</div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p><span className="font-medium">25</span> = Year (2025)</p>
                  <p><span className="font-medium">01</span> = Month (January)</p>
                  <p><span className="font-medium">27</span> = Day (27th)</p>
                  <p><span className="font-medium">4589</span> = Random number</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Benefits:</h4>
              <ul className="text-blue-800 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Easy to read and remember
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Sortable by date
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Unique across time periods
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Human-friendly for phone calls
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">&lt;100ms</div>
              <div className="text-sm text-slate-600">Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">100+</div>
              <div className="text-sm text-slate-600">Edge Locations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">99.9%</div>
              <div className="text-sm text-slate-600">Uptime SLA</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">0ms</div>
              <div className="text-sm text-slate-600">Cold Start</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};