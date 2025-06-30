import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Mail, Lock, ArrowLeft, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { dbService } from '../lib/supabase';
import { Footer } from '../components/Footer';

export const HRLogin: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try to authenticate with the database
      await dbService.authenticateHR(formData.email, formData.password);
      localStorage.setItem('hrAuth', 'true');
      navigate('/hr-dashboard');
    } catch (err: any) {
      setError('Invalid email or password. Use hr@company.com / demo123 for demo.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const copyCredentials = async () => {
    try {
      const credentials = 'hr@company.com\ndemo123';
      await navigator.clipboard.writeText(credentials);
      
      // Auto-fill the form
      setFormData({
        email: 'hr@company.com',
        password: 'demo123'
      });
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy credentials:', err);
    }
  };

  // Check if demo credentials are filled in
  const isDemoCredentialsFilled = formData.email === 'hr@company.com' && formData.password === 'demo123';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      <div className="flex-1 py-8 px-4">
        <div className="max-w-md mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="bg-white/80 backdrop-blur-xl border border-white/50 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-light text-slate-900 mb-2 tracking-tight">
                HR Portal Access
              </h1>
              <p className="text-slate-600 font-light leading-relaxed">
                Sign in to access the HR dashboard and manage employee feedback cases.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="hr@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
                {loading ? 'Signing In...' : 'Sign In to HR Portal'}
              </button>
            </form>

            {/* Demo Credentials - Only show when not filled in */}
            {!isDemoCredentialsFilled && (
              <div className="mt-8 p-6 bg-blue-50/80 border border-blue-200/50 rounded-2xl">
                <h3 className="font-semibold text-blue-900 mb-3 text-center">Demo Credentials</h3>
                <p className="text-sm text-blue-700 mb-4 text-center font-light">
                  Try the demo account to explore the HR dashboard and investigation workflow.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white/80 border border-blue-200/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Email:</span>
                      <span className="font-mono text-sm text-blue-800">hr@company.com</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Password:</span>
                      <span className="font-mono text-sm text-blue-800">demo123</span>
                    </div>
                  </div>

                  <button
                    onClick={copyCredentials}
                    className="w-full flex items-center justify-center gap-2 p-3 bg-white/80 text-slate-700 border border-slate-200 rounded-xl hover:bg-white hover:shadow-md transition-all duration-200 transform hover:scale-[1.02]"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-green-700 font-medium">Copied & Auto-filled!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="font-medium">Copy & Auto-fill Form</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-blue-600 mt-3 text-center font-light">
                  Click above to copy credentials and auto-fill the login form
                </p>
              </div>
            )}

            {/* Show a subtle confirmation when demo credentials are filled */}
            {isDemoCredentialsFilled && (
              <div className="mt-8 p-4 bg-green-50/80 border border-green-200/50 rounded-2xl text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="text-green-700 font-medium">Demo credentials loaded</span>
                </div>
                <p className="text-green-600 text-sm font-light">
                  Ready to explore the HR dashboard
                </p>
              </div>
            )}

            <div className="mt-6 text-center text-sm text-slate-500 font-light">
              This is a secure area for authorized HR personnel only.
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};