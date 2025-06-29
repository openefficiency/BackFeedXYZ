import React from 'react';
import { ExternalLink, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>© 2025 AegisWhistle LLC. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Powered by</span>
            <a 
              href="https://aegiswhistle.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-md font-medium hover:from-purple-200 hover:to-blue-200 transition-all duration-200 text-xs border border-purple-200 hover:border-purple-300"
            >
              <Zap className="w-3 h-3" />
              Aegis AI
              <ExternalLink className="w-2 h-2" />
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm font-medium text-blue-700">Show BackFeed your love</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span className="text-sm font-medium text-blue-700">g us in</span>
              <a 
                href="https://bolt.new/gallery/categories/community-social" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
              >
                Bolt Gallery - Community/Social
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};