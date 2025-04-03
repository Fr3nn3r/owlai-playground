import { useState } from 'react';
import {
  TwitterShareButton,
  LinkedinShareButton,
  FacebookShareButton,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
} from 'react-share';

function ShareButtons() {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  
  // Fixed share URL and messages
  const shareUrl = window.location.origin;
  const shareMessage = "Une intelligence artificielle gratuite 100% française et open source qui répond à des questions de droit.";
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 bg-white/80 p-3 rounded-lg shadow-lg transition-opacity duration-300 hover:opacity-100 opacity-70 z-50">
      <TwitterShareButton url={shareUrl} title={shareMessage}>
        <TwitterIcon size={32} round className="hover:scale-110 transition-transform" />
      </TwitterShareButton>

      <LinkedinShareButton 
        url={shareUrl} 
        title="OwlAI"
        description={shareMessage}>
        <LinkedinIcon size={32} round className="hover:scale-110 transition-transform" />
      </LinkedinShareButton>

      <FacebookShareButton 
        url={shareUrl} 
        quote={shareMessage}
        hashtag="OwlAI">
        <FacebookIcon size={32} round className="hover:scale-110 transition-transform" />
      </FacebookShareButton>

      {/* Copy Link Button */}
      <button
        onClick={handleCopyLink}
        className="relative bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        title="Copier le lien"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        
        {/* Copied tooltip */}
        {showCopiedTooltip && (
          <div className="absolute right-full mr-2 whitespace-nowrap bg-black text-white text-xs px-2 py-1 rounded">
            Lien copié!
          </div>
        )}
      </button>
    </div>
  );
}

export default ShareButtons; 