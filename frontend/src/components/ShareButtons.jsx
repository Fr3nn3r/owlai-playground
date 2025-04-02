import { useState } from 'react';
import {
  TwitterShareButton,
  LinkedinShareButton,
  FacebookShareButton,
  TwitterIcon,
  LinkedinIcon,
  FacebookIcon,
} from 'react-share';

function ShareButtons({ question, response, queryId }) {
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  // Generate the share URL with query parameters
  const shareUrl = `${window.location.origin}/shared/${queryId}`;
  
  // Default share message
  const defaultMessage = `Question: "${question}"\n\nRéponse de OwlAI:\n"${response.slice(0, 200)}${response.length > 200 ? '...' : ''}"`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShowCopiedTooltip(true);
      setTimeout(() => setShowCopiedTooltip(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const finalMessage = customMessage || defaultMessage;

  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 bg-white/80 p-3 rounded-lg shadow-lg transition-opacity duration-300 hover:opacity-100 opacity-70">
      {/* Share buttons */}
      <TwitterShareButton url={shareUrl} title={finalMessage}>
        <TwitterIcon size={32} round className="hover:scale-110 transition-transform" />
      </TwitterShareButton>

      <LinkedinShareButton 
        url={shareUrl} 
        title="OwlAI Response"
        summary={finalMessage}
        source="OwlAI">
        <LinkedinIcon size={32} round className="hover:scale-110 transition-transform" />
      </LinkedinShareButton>

      <FacebookShareButton url={shareUrl} quote={finalMessage}>
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

      {/* Customize Message Button */}
      <button
        onClick={() => setIsCustomizing(true)}
        className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
        title="Personnaliser le message"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {/* Customize Message Modal */}
      {isCustomizing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Personnaliser le message de partage</h3>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder={defaultMessage}
              className="w-full h-32 p-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setCustomMessage('');
                  setIsCustomizing(false);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Réinitialiser
              </button>
              <button
                onClick={() => setIsCustomizing(false)}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShareButtons; 