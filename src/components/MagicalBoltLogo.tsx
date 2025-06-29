import React, { useState } from 'react';
import { Zap } from 'lucide-react';

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

      {/* Round White Badge */}
      <div
        className={`cursor-pointer transition-all duration-300 ${
          isHovered ? 'scale-110 shadow-xl' : 'scale-100 shadow-lg'
        }`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-16 h-16 bg-white rounded-full flex flex-col items-center justify-center border border-gray-200 hover:border-gray-300">
          {/* Bolt Icon */}
          <Zap className="w-5 h-5 text-blue-600 mb-0.5" />
          
          {/* Text */}
          <div className="text-center">
            <div className="text-[6px] text-gray-500 font-medium leading-none">Powered by</div>
            <div className="text-[7px] text-gray-800 font-bold leading-none mt-0.5">Bolt.new</div>
          </div>
        </div>
      </div>
    </div>
  );
};