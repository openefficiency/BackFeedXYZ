import React, { useEffect } from 'react';
import { X, ExternalLink, Maximize2 } from 'lucide-react';

interface IframeModalProps {
  isOpen: boolean;
  onClose: () => void;
  iframeSrc: string;
  title?: string;
}

export const IframeModal: React.FC<IframeModalProps> = ({ 
  isOpen, 
  onClose, 
  iframeSrc, 
  title = "Aegis AI" 
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click to close modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Open in new tab function
  const openInNewTab = () => {
    window.open(iframeSrc, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-4 my-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">🤖</span>
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Open in new tab button */}
            <button
              onClick={openInNewTab}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </button>
            
            {/* Maximize button (visual only) */}
            <button
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Fullscreen view"
            >
              <Maximize2 className="w-5 h-5" />
            </button>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="absolute inset-0 top-16 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading Aegis AI...</p>
          </div>
        </div>

        {/* Iframe */}
        <iframe
          src={iframeSrc}
          className="w-full h-full border-none bg-white"
          style={{ height: 'calc(100% - 64px)' }} // Subtract header height
          title={title}
          allow="microphone; camera; autoplay; encrypted-media; fullscreen"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals allow-top-navigation-by-user-activation"
          onLoad={() => {
            // Hide loading indicator when iframe loads
            const loadingDiv = document.querySelector('.absolute.inset-0.top-16');
            if (loadingDiv) {
              (loadingDiv as HTMLElement).style.display = 'none';
            }
          }}
        />

        {/* Keyboard shortcut hint */}
        <div className="absolute bottom-4 left-4 text-xs text-slate-500 bg-white/90 px-2 py-1 rounded">
          Press <kbd className="px-1 py-0.5 bg-slate-200 rounded text-xs">Esc</kbd> to close
        </div>
      </div>
    </div>
  );
};