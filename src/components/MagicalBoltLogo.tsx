import React, { useState } from 'react';

export const MagicalBoltLogo: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-12 -left-8 bg-black/90 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap animate-in fade-in duration-200">
          Visit Bolt.new
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-black/90 rotate-45"></div>
        </div>
      )}

      {/* Circular Badge */}
      <div
        className={`cursor-pointer transition-all duration-300 ${
          isHovered ? 'scale-110 shadow-xl' : 'scale-100 shadow-lg'
        }`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative w-16 h-16 bg-black rounded-full flex items-center justify-center border-2 border-gray-800 hover:border-gray-600">
          {/* Circular Text */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
            <defs>
              <path
                id="circle-path"
                d="M 32, 32 m -26, 0 a 26,26 0 1,1 52,0 a 26,26 0 1,1 -52,0"
              />
            </defs>
            <text className="fill-white text-[6px] font-bold tracking-wider">
              <textPath href="#circle-path" startOffset="0%">
                POWERED BY BOLT.NEW • POWERED BY BOLT.NEW • 
              </textPath>
            </text>
          </svg>
          
          {/* Central "b" Logo */}
          <div className="relative z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-black text-lg font-black italic">b</span>
          </div>
        </div>
      </div>
    </div>
  );
};