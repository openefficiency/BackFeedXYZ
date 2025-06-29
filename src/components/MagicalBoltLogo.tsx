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
      x: Math.random() * 100 - 50,
      y: Math.random() * 100 - 50,
      delay: Math.random() * 0.5
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
    setTimeout(() => setIsClicked(false), 300);
    
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
    <div className="fixed top-4 right-4 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -bottom-16 right-0 bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <Code className="w-3 h-3" />
            <span>Built with Bolt.new</span>
            <ExternalLink className="w-3 h-3" />
          </div>
          <div className="absolute top-0 right-4 -translate-y-1 w-2 h-2 bg-black rotate-45"></div>
        </div>
      )}

      {/* Main Logo Container */}
      <div
        className={`relative cursor-pointer transition-all duration-300 ${
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
            className="absolute pointer-events-none"
            style={{
              left: `${sparkle.x}px`,
              top: `${sparkle.y}px`,
              animationDelay: `${sparkle.delay}s`
            }}
          >
            <Sparkles 
              className="w-3 h-3 text-yellow-400 animate-ping" 
              style={{
                animationDuration: '1s',
                animationIterationCount: '3'
              }}
            />
          </div>
        ))}

        {/* Outer Glow Ring */}
        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
          isHovered 
            ? 'bg-gradient-to-r from-blue-400/30 via-purple-400/30 to-pink-400/30 blur-md scale-150' 
            : 'bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 blur-sm scale-125'
        }`}></div>

        {/* Main Circle */}
        <div className={`relative w-14 h-14 rounded-full transition-all duration-300 ${
          isHovered 
            ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl shadow-purple-500/50' 
            : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg shadow-purple-600/30'
        } border-2 border-white/20 backdrop-blur-sm`}>
          
          {/* Inner Glow */}
          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent"></div>
          
          {/* Bolt Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap className={`transition-all duration-300 text-white ${
              isHovered ? 'w-7 h-7 drop-shadow-lg' : 'w-6 h-6'
            } ${isClicked ? 'animate-pulse' : ''}`} />
          </div>

          {/* Rotating Border */}
          <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
            isHovered ? 'animate-spin' : ''
          }`} style={{ animationDuration: '3s' }}>
            <div className="w-full h-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
        </div>

        {/* Pulse Effect */}
        {isClicked && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-ping opacity-75"></div>
        )}

        {/* Floating Hearts (Easter Egg) */}
        {isClicked && (
          <>
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 animate-bounce">
              <Heart className="w-4 h-4 text-red-400 fill-current animate-pulse" />
            </div>
            <div className="absolute -top-6 -right-6 animate-bounce" style={{ animationDelay: '0.2s' }}>
              <Rocket className="w-3 h-3 text-yellow-400 animate-pulse" />
            </div>
          </>
        )}
      </div>

      {/* Background Ambient Light */}
      {isHovered && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-4 right-4 w-32 h-32 bg-gradient-radial from-purple-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
        </div>
      )}
    </div>
  );
};