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
    <div className="fixed bottom-4 right-4 z-50">
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute -top-10 -left-16 bg-black/90 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap animate-in fade-in duration-200">
          Click to visit Bolt.new
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 w-2 h-2 bg-black/90 rotate-45"></div>
        </div>
      )}

      {/* Official Bolt.new Logo */}
      <div
        className={`cursor-pointer transition-all duration-200 ${
          isHovered ? 'scale-105 opacity-100' : 'scale-100 opacity-90'
        } hover:drop-shadow-lg`}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Using the official Bolt.new logo as SVG */}
        <svg
          width="120"
          height="32"
          viewBox="0 0 120 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-sm"
        >
          {/* Background */}
          <rect width="120" height="32" rx="16" fill="white" />
          
          {/* Bolt Icon */}
          <path
            d="M12 8L8 16H12L10 24L16 12H12L12 8Z"
            fill="#3B82F6"
            stroke="#3B82F6"
            strokeWidth="0.5"
          />
          
          {/* "Built with" text */}
          <text
            x="26"
            y="12"
            fontSize="8"
            fill="#6B7280"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="400"
          >
            Built with
          </text>
          
          {/* "Bolt.new" text */}
          <text
            x="26"
            y="22"
            fontSize="10"
            fill="#111827"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontWeight="600"
          >
            Bolt.new
          </text>
        </svg>
      </div>
    </div>
  );
};