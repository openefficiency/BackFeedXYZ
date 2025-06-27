import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, BarChart3, Globe, Shield } from 'lucide-react';
import { ProductionMonitor } from '../components/ProductionMonitor';

export const ProductionDashboard: React.FC = () => {
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
            Production Monitoring Dashboard
          </h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Real-time monitoring and analytics for your Netlify Edge Function deployment. 
            Track performance, uptime, and system health across global edge locations.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Global Edge</h3>
            <p className="text-slate-600 text-sm">
              Functions deployed to 100+ edge locations worldwide for ultra-low latency.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Real-time</h3>
            <p className="text-slate-600 text-sm">
              Sub-100ms response times with zero cold starts for instant tracking code generation.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics</h3>
            <p className="text-slate-600 text-sm">
              Comprehensive monitoring with detailed metrics and performance insights.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure</h3>
            <p className="text-slate-600 text-sm">
              Enterprise-grade security with webhook verification and CORS protection.
            </p>
          </div>
        </div>

        {/* Main Monitoring Component */}
        <ProductionMonitor className="mb-8" />

        {/* Deployment Status */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Deployment Status</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Infrastructure</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Netlify Edge Functions:</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Global CDN:</span>
                  <span className="text-green-600 font-medium">✓ Distributed</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Auto-scaling:</span>
                  <span className="text-green-600 font-medium">✓ Enabled</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Load Balancing:</span>
                  <span className="text-green-600 font-medium">✓ Automatic</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Integration Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">ElevenLabs Webhook:</span>
                  <span className="text-green-600 font-medium">✓ Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Database Integration:</span>
                  <span className="text-green-600 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Environment Variables:</span>
                  <span className="text-green-600 font-medium">✓ Configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">CORS Protection:</span>
                  <span className="text-green-600 font-medium">✓ Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Quick Actions</h3>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Link
              to="/netlify-tracking"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
            >
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium text-slate-900">Test Integration</div>
                <div className="text-sm text-slate-600">Test webhook endpoints</div>
              </div>
            </Link>

            <a
              href="https://app.netlify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
            >
              <Globe className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-slate-900">Netlify Dashboard</div>
                <div className="text-sm text-slate-600">View detailed logs</div>
              </div>
            </a>

            <Link
              to="/hr-dashboard"
              className="flex items-center gap-3 p-4 bg-white rounded-lg hover:shadow-md transition-all"
            >
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium text-slate-900">Case Analytics</div>
                <div className="text-sm text-slate-600">View tracking data</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};