import React from 'react';
import PropTypes from 'prop-types';

const DefaultQueries = ({ queries, onQuerySelect, selectedAgent }) => {
  if (!queries || queries.length === 0 || !selectedAgent) {
    return null;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-gray-700">Questions Suggérées</h2>
      <div className="space-y-3">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(query)}
            className="w-full text-left p-3 rounded-xl bg-white border border-neutral-200 hover:border-primary-light hover:bg-primary-50 transition-all duration-200 shadow-soft hover:shadow-hover active:scale-95 animate-fadeInUp"
            style={{
              animationDelay: `${index * 50}ms`,
              '--tw-translate-y': '0',
              '--tw-scale-x': '1',
              '--tw-scale-y': '1',
            }}
          >
            <span className="text-sm text-neutral-700 hover:text-primary-dark transition-colors duration-200">
              {query}
            </span>
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