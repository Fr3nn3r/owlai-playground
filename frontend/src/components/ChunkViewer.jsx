import { useState } from 'react';

function ChunkViewer({ chunks, isLoading }) {
  const [expandedChunks, setExpandedChunks] = useState(new Set());

  const toggleChunk = (chunkId) => {
    setExpandedChunks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chunkId)) {
        newSet.delete(chunkId);
      } else {
        newSet.add(chunkId);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (!chunks?.length) {
    return (
      <div className="text-gray-500 text-center py-4">
        Aucun extrait de document disponible pour cette requête.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Documents Sources ({chunks.length})
      </h3>
      {chunks.map((chunk) => (
        <div
          key={chunk.id}
          className="border border-gray-200 rounded-lg hover:border-primary transition-colors"
        >
          <button
            onClick={() => toggleChunk(chunk.id)}
            className="w-full text-left px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-900">
                {chunk.source}
              </span>
              <span className="text-xs text-gray-500">
                Score: {(chunk.relevance_score * 100).toFixed(1)}%
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedChunks.has(chunk.id) ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          
          {expandedChunks.has(chunk.id) && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <div className="text-sm text-gray-700 whitespace-pre-wrap">
                {chunk.content}
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Document: {chunk.source}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ChunkViewer; 