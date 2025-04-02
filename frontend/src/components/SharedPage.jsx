import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MetaTags from './MetaTags';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import config from '../config';

function SharedPage() {
  const { queryId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sharedContent, setSharedContent] = useState(null);

  useEffect(() => {
    const fetchSharedContent = async () => {
      try {
        const response = await fetch(`${config.API_URL}/query/${queryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch shared content');
        }
        const data = await response.json();
        setSharedContent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedContent();
  }, [queryId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!sharedContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Contenu non trouvé</h1>
          <p className="text-gray-600">Le contenu partagé n'est plus disponible ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MetaTags
        title={`OwlAI - ${sharedContent.question}`}
        description={sharedContent.response.slice(0, 150) + '...'}
      />
      
      {/* Fixed owl background */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/owl-default.jpg")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.9,
          zIndex: 0
        }}
      />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <div className="bg-white/60 rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Question</h1>
          <p className="text-lg mb-6">{sharedContent.question}</p>
          
          <h2 className="text-xl font-bold mb-2">Réponse de OwlAI</h2>
          <div className="bg-gray-50/60 rounded-lg p-4">
            <p className="whitespace-pre-wrap">{sharedContent.response}</p>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/"
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Poser une question à OwlAI
          </a>
        </div>
      </div>
    </div>
  );
}

export default SharedPage; 