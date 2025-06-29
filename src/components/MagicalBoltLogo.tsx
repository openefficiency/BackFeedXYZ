import React, { useState, useEffect } from 'react';
import { Zap, ExternalLink, Sparkles, Code, Rocket, Heart } from 'lucide-react';

export const MagicalBoltLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [showTooltip, setShowTooltip] = useState(false);

  // Generate random sparkles around the logo
  const generateSparkles = () => {
    const newSparkles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 200 - 100,
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
      {/* Enhanced Tooltip */}
      {showTooltip && (
        <div className="absolute -top-20 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-2xl whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-700">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="font-medium">Click to explore Bolt.new</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </div>
          <div className="text-xs text-slate-400 mt-1">The AI-powered development platform</div>
          <div className="absolute bottom-0 right-6 translate-y-1 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
        </div>
      )}

      {/* Main Logo Container */}
      <div
        className={`relative cursor-pointer transition-all duration-500 ${
          isHovered ? 'scale-105' : 'scale-100'
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
              left: `${sparkle.x + 80}px`,
              top: `${sparkle.y + 20}px`,
              animationDelay: `${sparkle.delay}s`
            }}
          >
            <Sparkles 
              className="w-3 h-3 text-yellow-400 animate-ping" 
              style={{
                animationDuration: '1.5s',
                animationIterationCount: '4'
              }}
            />
          </div>
        ))}

        {/* Outer Glow */}
        <div className={`absolute inset-0 rounded-2xl transition-all duration-700 ${
          isHovered 
            ? 'bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-xl scale-110' 
            : 'bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-pink-400/5 blur-lg scale-105'
        }`}></div>

        {/* Main Badge Container */}
        <div className={`relative px-4 py-2 rounded-2xl transition-all duration-500 ${
          isHovered 
            ? 'bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 shadow-2xl shadow-purple-500/30 border-2 border-purple-400/30' 
            : 'bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 shadow-xl shadow-slate-900/50 border-2 border-slate-700/50'
        } backdrop-blur-md`}>
          
          {/* Inner Glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
          
          {/* Content */}
          <div className="relative flex items-center gap-3">
            {/* Bolt Icon */}
            <div className={`transition-all duration-300 ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isClicked ? 'animate-pulse' : ''}`}>
              <div className={`p-2 rounded-xl transition-all duration-300 ${
                isHovered 
                  ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                  : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-md'
              }`}>
                <Zap className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Text Content */}
            <div className="flex flex-col">
              <div className={`text-sm font-semibold transition-all duration-300 ${
                isHovered 
                  ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent' 
                  : 'text-white'
              }`}>
                Built with
              </div>
              <div className={`text-lg font-bold transition-all duration-300 ${
                isHovered 
                  ? 'bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent' 
                  : 'text-slate-200'
              } leading-tight`}>
                Bolt.new
              </div>
            </div>

            {/* Arrow Icon */}
            <div className={`transition-all duration-300 ${
              isHovered ? 'translate-x-1 opacity-100' : 'translate-x-0 opacity-60'
            }`}>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Animated Border */}
          <div className={`absolute inset-0 rounded-2xl transition-all duration-1000 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
          </div>
        </div>

        {/* Pulse Effect */}
        {isClicked && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 animate-ping"></div>
        )}

        {/* Floating Celebration Icons (Easter Egg) */}
        {isClicked && (
          <>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
              <Heart className="w-5 h-5 text-red-400 fill-current animate-pulse" />
            </div>
            <div className="absolute -top-6 -right-8 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Rocket className="w-4 h-4 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute -top-4 -left-8 animate-bounce" style={{ animationDelay: '0.4s' }}>
              <Code className="w-4 h-4 text-green-400 animate-pulse" />
            </div>
          </>
        )}
      </div>

      {/* Background Ambient Light */}
      {isHovered && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-gradient-radial from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        </div>
      )}
    </div>
  );
};