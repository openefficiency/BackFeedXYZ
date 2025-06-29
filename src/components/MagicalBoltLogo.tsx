import React, { useState, useEffect } from 'react';
import { Zap, ExternalLink, Sparkles, Code, Rocket, Heart } from 'lucide-react';

export const MagicalBoltLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate random sparkles around the logo
  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 80 - 40,
      y: Math.random() * 80 - 40,
      delay: Math.random() * 0.8
    }));
    setSparkles(newSparkles);
  };

  useEffect(() => {
    if (isHovered) {
      generateSparkles();
    }
  }, [isHovered]);

  const handleClick = () => {
    setIsClicked(true);
    generateSparkles();
    
    // Reset click animation after a short delay
    setTimeout(() => setIsClicked(false), 400);
    
    // Open Bolt.new in a new tab
    window.open('https://bolt.new', '_blank', 'noopener,noreferrer');
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Compact Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 -left-8 bg-gradient-to-r from-slate-900 to-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-xl whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-600">
          <div className="flex items-center gap-1">
            <Code className="w-3 h-3 text-blue-400" />
            <span className="font-medium">Built with Bolt.new</span>
            <ExternalLink className="w-2 h-2 text-slate-400" />
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-600"></div>
        </div>
      )}

      {/* Main Circular Logo Container */}
      <div
        className={`relative cursor-pointer transition-all duration-500 ${
          isHovered ? 'scale-110' : 'scale-100'
        } ${isClicked ? 'scale-95' : ''}`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sparkles */}
        {isHovered && sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${sparkle.x + 24}px`,
              top: `${sparkle.y + 24}px`,
              animationDelay: `${sparkle.delay}s`
            }}
          >
            <Sparkles 
              className="w-2 h-2 text-yellow-400 animate-ping" 
              style={{
                animationDuration: '1.5s',
                animationIterationCount: '3'
              }}
            />
          </div>
        ))}

        {/* Outer Glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
          isHovered 
            ? 'bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-lg scale-125' 
            : 'bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-md scale-110'
        }`}></div>

        {/* Main Circular Badge */}
        <div className={`relative w-12 h-12 rounded-full transition-all duration-500 ${
          isHovered 
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl shadow-purple-500/40 border-2 border-purple-400/40' 
            : 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-xl shadow-slate-900/60 border-2 border-slate-700/60'
        } backdrop-blur-md flex items-center justify-center`}>
          
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-white/20 to-white/10"></div>
          
          {/* Bolt Icon */}
          <div className={`relative transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } ${isClicked ? 'animate-pulse' : ''}`}>
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
              isHovered 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/60' 
                : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-md'
            }`}>
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Animated Border */}
          <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Pulse Effect */}
        {isClicked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/40 via-purple-400/40 to-pink-400/40 animate-ping"></div>
        )}

        {/* Floating Celebration Icons (Easter Egg) */}
        {isClicked && (
          <>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce">
              <Heart className="w-3 h-3 text-red-400 fill-current animate-pulse" />
            </div>
            <div className="absolute -top-4 -right-6 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Rocket className="w-3 h-3 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -top-2 -left-6 animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Code className="w-3 h-3 text-green-400 animate-pulse" />
            </div>
          </>
        )}
      </div>

      {/* Background Ambient Light */}
      {isHovered && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute bottom-4 right-4 w-24 h-24 bg-gradient-radial from-purple-500/15 via-blue-500/8 to-transparent rounded-full blur-2xl animate-pulse"></div>
        </div>
      )}
    </div>
  );
};