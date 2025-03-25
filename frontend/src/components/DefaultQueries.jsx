import React from 'react';
import PropTypes from 'prop-types';

const DefaultQueries = ({ queries, onQuerySelect, selectedAgent }) => {
  if (!queries || queries.length === 0 || !selectedAgent) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 
        className="text-sm font-medium mb-2"
        style={{ color: selectedAgent.color_theme.primary }}
      >
        Suggested Questions:
      </h4>
      <div className="flex flex-wrap gap-2">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(query)}
            className="text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: selectedAgent.color_theme.primary + '15',
              borderColor: selectedAgent.color_theme.secondary,
              borderWidth: '1px',
              color: selectedAgent.color_theme.primary
            }}
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
};

DefaultQueries.propTypes = {
  queries: PropTypes.arrayOf(PropTypes.string),
  onQuerySelect: PropTypes.func.isRequired,
  selectedAgent: PropTypes.shape({
    color_theme: PropTypes.shape({
      primary: PropTypes.string.isRequired,
      secondary: PropTypes.string.isRequired,
    }).isRequired,
  }),
};

export default DefaultQueries; 