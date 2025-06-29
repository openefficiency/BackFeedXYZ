import React from 'react';
import { ExternalLink, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>© 2025 BackFeed</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Powered by</span>
            <a 
              href="https://aegiswhistle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Zap className="w-4 h-4" />
              Aegis AI
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm font-medium text-blue-700">Show your love in</span>
              <a 
                href="https://bolt.new/gallery/categories/all" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Bolt Gallery
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};