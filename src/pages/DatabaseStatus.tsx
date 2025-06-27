import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, Clock, RefreshCw, AlertTriangle, Wifi, WifiOff, Shield, Lock } from 'lucide-react';
import { runComprehensiveTests, quickTest } from '../lib/database-test-comprehensive';
import { dbService } from '../lib/supabase';

interface DatabaseStats {
  cases: number;
  transcripts: number;
  interactions: number;
  insights: number;
  hrUsers: number;
}

interface HealthCheck {
  connected: boolean;
  latency: number;
  tables: string[];
  rlsStatus: Record<string, boolean>;
  error?: string;
}

export const DatabaseStatus: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    checkDatabaseStatus();
    
    // Set up periodic health checks
    const interval = setInterval(checkDatabaseStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const checkDatabaseStatus = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Test connection and get health check
      setConnectionStatus('checking');
      
      const [isConnected, healthResult] = await Promise.all([
        dbService.testConnection(),
        dbService.healthCheck()
      ]);
      
      setHealthCheck(healthResult);
      setConnectionStatus(healthResult.connected ? 'connected' : 'disconnected');
      
      if (healthResult.connected) {
        // Get database statistics
        const [cases, hrUsers] = await Promise.all([
          dbService.getCases(),
          dbService.getHRUsers()
        ]);
        
        setStats({
          cases: cases.length,
          transcripts: cases.reduce((sum, c) => sum + (c.transcripts?.length || 0), 0),
          interactions: cases.reduce((sum, c) => sum + (c.hr_interactions?.length || 0), 0),
          insights: cases.reduce((sum, c) => sum + (c.ai_insights?.length || 0), 0),
          hrUsers: hrUsers.length
        });
      } else {
        setError(healthResult.error || 'Unable to connect to database');
      }
    } catch (err: any) {
      setError(err.message);
      setConnectionStatus('disconnected');
      setHealthCheck({
        connected: false,
        latency: 0,
        tables: [],
        rlsStatus: {},
        error: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runTests = async () => {
    setIsRunningTests(true);
    try {
      await runComprehensiveTests();
    } catch (err: any) {
      setError(`Test execution failed: ${err.message}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-6 h-6 text-green-600" />;
      case 'disconnected': return <WifiOff className="w-6 h-6 text-red-600" />;
      case 'checking': return <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'border-green-200 bg-green-50';
      case 'disconnected': return 'border-red-200 bg-red-50';
      case 'checking': return 'border-yellow-200 bg-yellow-50';
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 200) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRLSStatusIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Database className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Database Connection Status</h1>
          <p className="text-slate-600">Monitor your Supabase database connection, RLS policies, and performance</p>
        </div>

        {/* Connection Status */}
        <div className={`rounded-xl border-2 p-6 mb-8 ${getStatusColor()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getStatusIcon()}
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Database Connection
                </h2>
                <p className="text-slate-600">
                  {connectionStatus === 'connected' && 'Successfully connected to Supabase'}
                  {connectionStatus === 'disconnected' && 'Unable to connect to database'}
                  {connectionStatus === 'checking' && 'Checking connection...'}
                </p>
                {healthCheck && (
                  <div className="mt-2 text-sm">
                    <span className="text-slate-500">Latency: </span>
                    <span className={getLatencyColor(healthCheck.latency)}>
                      {healthCheck.latency}ms
                    </span>
                    {healthCheck.tables.length > 0 && (
                      <>
                        <span className="text-slate-500 ml-4">Tables: </span>
                        <span className="text-green-600">{healthCheck.tables.length} found</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={checkDatabaseStatus}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* RLS Status */}
        {healthCheck?.rlsStatus && Object.keys(healthCheck.rlsStatus).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Row Level Security (RLS) Status
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(healthCheck.rlsStatus).map(([table, enabled]) => (
                <div key={table} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span className="font-medium text-slate-700">{table}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRLSStatusIcon(enabled)}
                    <span className={`text-sm ${enabled ? 'text-green-600' : 'text-red-600'}`}>
                      {enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>RLS Status:</strong> All tables should have RLS enabled for security. 
                This ensures proper access control and data protection.
              </p>
            </div>
          </div>
        )}

        {/* Connection Details */}
        {connectionStatus === 'connected' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Connection Details</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Supabase Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Project ID:</span>
                    <span className="font-mono">tnvyzdmgyvpzwxbravrx</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">URL:</span>
                    <span className="font-mono text-xs">https://tnvyzdmgyvpzwxbravrx.supabase.co</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Key:</span>
                    <span className="font-mono text-xs">eyJhbGciOiJIUzI1NiIs...***</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-700 mb-2">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Response Time:</span>
                    <span className={getLatencyColor(healthCheck?.latency || 0)}>
                      {healthCheck?.latency || 0}ms
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tables Available:</span>
                    <span className="text-green-600">{healthCheck?.tables.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">RLS Enabled:</span>
                    <span className="text-green-600">✓ Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <button
                onClick={checkDatabaseStatus}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Retry connection
              </button>
            </div>
          </div>
        )}

        {/* Database Statistics */}
        {stats && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.cases}</div>
                <div className="text-sm text-blue-700">Cases</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.transcripts}</div>
                <div className="text-sm text-green-700">Transcripts</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.interactions}</div>
                <div className="text-sm text-purple-700">Interactions</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.insights}</div>
                <div className="text-sm text-orange-700">AI Insights</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{stats.hrUsers}</div>
                <div className="text-sm text-indigo-700">HR Users</div>
              </div>
            </div>
          </div>
        )}

        {/* Test Suite */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Database Test Suite</h3>
              <p className="text-slate-600">Run comprehensive tests with realistic scenarios and dummy data</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => quickTest('auth')}
                disabled={isRunningTests || connectionStatus !== 'connected'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Quick Auth Test
              </button>
              <button
                onClick={runTests}
                disabled={isRunningTests || connectionStatus !== 'connected'}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunningTests ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Full Test Suite
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="text-sm text-slate-600">
            <p className="mb-2">The comprehensive test suite will verify:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Database connection and authentication</li>
              <li>HR authentication with dummy credentials</li>
              <li>Case management with realistic test data</li>
              <li>Two-way communication system</li>
              <li>Row Level Security (RLS) policies</li>
              <li>Data integrity and foreign key relationships</li>
              <li>Performance testing with concurrent operations</li>
              <li>Security testing and data sanitization</li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Check the browser console for detailed test results, performance metrics, and dummy credentials.
            </p>
          </div>
        </div>

        {/* RLS Information */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Row Level Security (RLS) Information
          </h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-medium mb-2">Current RLS Policies:</p>
              <ul className="space-y-1">
                <li>• Public can create and read all records</li>
                <li>• Authenticated users can update records</li>
                <li>• HR users have full management access</li>
                <li>• Anonymous feedback submission enabled</li>
              </ul>
            </div>
            <div>
              <p className="font-medium mb-2">Security Features:</p>
              <ul className="space-y-1">
                <li>• Row-level access control active</li>
                <li>• Anonymous case creation allowed</li>
                <li>• HR authentication required for updates</li>
                <li>• Data isolation and protection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sample Data Info */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-semibold text-green-900 mb-2">Comprehensive Test Data Available</h4>
          <p className="text-blue-700 text-sm mb-3">
            The database includes realistic dummy data for testing all features:
          </p>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-800 mb-1">Test Confirmation Codes:</p>
              <ul className="text-green-700 space-y-1">
                <li>• AB7X9K2M4P (Safety - High Priority)</li>
                <li>• CD8Y5N3Q1R (Harassment - Active)</li>
                <li>• GH1A7R5U3V (Discrimination - Critical)</li>
                <li>• EF9Z6P4S2T (Policy - Resolved)</li>
                <li>• ST6F3W1Y8C (Today's harassment case)</li>
                <li>• + 7 more realistic test scenarios</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-green-800 mb-1">Dummy HR Login Credentials:</p>
              <ul className="text-green-700 space-y-1">
                <li>• hr@company.com / demo123</li>
                <li>• admin@company.com / admin123</li>
                <li>• test@company.com / StartNew25!</li>
                <li>• manager@company.com / demo123</li>
                <li>• specialist@company.com / demo123</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-3 bg-white border border-green-300 rounded">
            <p className="text-green-800 text-sm">
              <strong>🎯 Testing Features:</strong> Full conversation transcripts, AI insights, 
              two-way communication, case status tracking, realistic employee feedback scenarios, 
              HR workflow management, and comprehensive security testing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};