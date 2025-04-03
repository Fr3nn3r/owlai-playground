import {
  TwitterShareButton,
  LinkedinShareButton,
  TwitterIcon,
  LinkedinIcon,
} from 'react-share';

function ShareButtons() {
  // Fixed share URL for the main site
  const shareUrl = window.location.origin;
  const shareTitle = "Découvrez OwlAI - Votre assistant intelligent";
  
  return (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-3 bg-white/80 p-3 rounded-lg shadow-lg transition-opacity duration-300 hover:opacity-100 opacity-70 z-50">
      <TwitterShareButton url={shareUrl} title={shareTitle}>
        <TwitterIcon size={32} round className="hover:scale-110 transition-transform" />
      </TwitterShareButton>

      <LinkedinShareButton 
        url={shareUrl} 
        title={shareTitle}
        source="OwlAI">
        <LinkedinIcon size={32} round className="hover:scale-110 transition-transform" />
      </LinkedinShareButton>
    </div>
  );
}

export default ShareButtons; 