import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_OWL_IMAGE = '/owl-default.jpg';

const AgentSelector = ({ agents, selectedAgent, onSelect, className }) => {
  // Keep track of which images failed to load
  const [failedImages, setFailedImages] = useState(new Set());

  if (!agents || agents.length === 0) {
    return null;
  }

  const handleImageError = (agentId, imageUrl) => {
    console.error(`Failed to load image for agent ${agentId}:`, {
      attemptedUrl: imageUrl,
      fallbackUrl: DEFAULT_OWL_IMAGE,
      timestamp: new Date().toISOString()
    });
    setFailedImages(prev => new Set([...prev, agentId]));
  };

  const getImageUrl = (agent) => {
    if (failedImages.has(agent.id) || !agent.owl_image_url) {
      console.warn(`Using default image for agent ${agent.id}:`, {
        originalUrl: agent.owl_image_url,
        fallbackUrl: DEFAULT_OWL_IMAGE
      });
      return DEFAULT_OWL_IMAGE;
    }
    // Ensure the URL starts with a forward slash
    const imageUrl = agent.owl_image_url.startsWith('/') 
      ? agent.owl_image_url 
      : `/${agent.owl_image_url}`;
    return imageUrl;
  };

  return (
    <div role="list" className={`flex flex-col ${className}`}>
      {agents.map((agent) => (
        <div
          key={agent.id}
          role="button"
          tabIndex={0}
          className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-hover ${
            selectedAgent?.id === agent.id
              ? 'ring-2 ring-offset-2 shadow-soft ring-primary'
              : 'shadow-soft hover:shadow-glow'
          }`}
          style={{
            backgroundColor: 'white',
            borderColor: selectedAgent?.id === agent.id ? '#2563EB' : '#E5E7EB',
            borderWidth: '2px',
          }}
          onClick={() => onSelect(agent)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onSelect(agent);
            }
          }}
        >
          <div className="flex items-start space-x-4">
            <div className="relative w-16 h-16">
              <img
                src={getImageUrl(agent)}
                alt={`${agent.name} owl avatar`}
                className="w-16 h-16 rounded-full object-cover shadow-soft transition-transform duration-300 hover:scale-110"
                onError={() => handleImageError(agent.id, agent.owl_image_url)}
                loading="lazy"
              />
              {failedImages.has(agent.id) && (
                <div 
                  className="absolute inset-0 flex items-center justify-center rounded-full text-xs text-neutral-500"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  Using default
                </div>
              )}
            </div>
            <div className="flex-1">
              <p 
                className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary inline-block mb-3"
                style={{
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                }}
              >
                {agent.welcome_title}
              </p>
              <h3 
                className="text-lg font-semibold mb-2 tracking-tight text-neutral-800"
              >
                {agent.name}
              </h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{agent.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

AgentSelector.propTypes = {
  agents: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      welcome_title: PropTypes.string.isRequired,
      owl_image_url: PropTypes.string.isRequired,
      color_theme: PropTypes.shape({
        primary: PropTypes.string.isRequired,
        secondary: PropTypes.string.isRequired,
      }).isRequired,
    })
  ).isRequired,
  selectedAgent: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default AgentSelector;
