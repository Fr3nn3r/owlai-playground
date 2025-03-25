import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DEFAULT_OWL_IMAGE = '/owl-default.jpg';

const AgentSelector = ({ agents, selectedAgent, onSelect, className }) => {
  // Keep track of which images failed to load
  const [failedImages, setFailedImages] = useState(new Set());

  if (!agents || agents.length === 0) {
    return null;
  }

  const handleImageError = (agentId) => {
    setFailedImages(prev => new Set([...prev, agentId]));
  };

  const getImageUrl = (agent) => {
    if (failedImages.has(agent.id) || !agent.owl_image_url) {
      return DEFAULT_OWL_IMAGE;
    }
    return agent.owl_image_url;
  };

  return (
    <div role="list" className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {agents.map((agent) => (
        <div
          key={agent.id}
          role="button"
          tabIndex={0}
          className={`p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
            selectedAgent?.id === agent.id
              ? 'ring-2 ring-offset-2'
              : 'hover:shadow-lg'
          }`}
          style={{
            backgroundColor: agent.color_theme.primary + '10',
            borderColor: agent.color_theme.secondary,
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
                className="w-16 h-16 rounded-full object-cover"
                onError={() => handleImageError(agent.id)}
                loading="lazy"
              />
              {failedImages.has(agent.id) && (
                <div 
                  className="absolute inset-0 flex items-center justify-center rounded-full text-xs text-gray-500"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                >
                  Using default
                </div>
              )}
            </div>
            <div>
              <h3 
                className="text-lg font-semibold mb-1"
                style={{ color: agent.color_theme.primary }}
              >
                {agent.name}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{agent.description}</p>
              <p 
                className="text-sm italic"
                style={{ color: agent.color_theme.secondary }}
              >
                {agent.welcome_title}
              </p>
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
