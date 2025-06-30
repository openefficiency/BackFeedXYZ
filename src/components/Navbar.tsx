import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Mic, Shield, Search, Menu, X, ExternalLink, Zap, Database } from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const NavLink: React.FC<{ to: string; children: React.ReactNode; icon: React.ReactNode }> = ({ to, children, icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive(to)
          ? 'bg-blue-600 text-white shadow-lg'
          : 'text-slate-600 hover:text-blue-600 hover:bg-white hover:shadow-md'
      }`}
      onClick={() => setIsMenuOpen(false)}
    >
      {icon}
      <span className="font-medium">{children}</span>
    </Link>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-slate-800">BackFeed</h1>
              </div>
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500">
              <span>Powered by</span>
              <a 
                href="https://aegiswhistle.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Zap className="w-3 h-3" />
                Aegis AI
                <ExternalLink className="w-2 h-2" />
              </a>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink to="/voice-dashboard" icon={<Database className="w-4 h-4" />}>
              Voice Dashboard
            </NavLink>
            <NavLink to="/track" icon={<Search className="w-4 h-4" />}>
              Track Case
            </NavLink>
            <NavLink to="/hr-login" icon={<Shield className="w-4 h-4" />}>
              HR Portal
            </NavLink>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-white"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200">
            <div className="flex flex-col gap-2">
              <NavLink to="/voice-dashboard" icon={<Database className="w-4 h-4" />}>
                Voice Dashboard
              </NavLink>
              <NavLink to="/track" icon={<Search className="w-4 h-4" />}>
                Track Case
              </NavLink>
              <NavLink to="/hr-login" icon={<Shield className="w-4 h-4" />}>
                HR Portal
              </NavLink>
            </div>
            
            {/* Mobile Aegis AI Button */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-1 text-xs text-slate-500 justify-center">
                <span>Powered by</span>
                <a 
                  href="https://aegiswhistle.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Zap className="w-3 h-3" />
                  Aegis AI
                  <ExternalLink className="w-2 h-2" />
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};