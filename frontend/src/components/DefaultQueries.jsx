import React from 'react';
import PropTypes from 'prop-types';

const DefaultQueries = ({ queries, onQuerySelect, selectedAgent }) => {
  if (!queries || queries.length === 0 || !selectedAgent) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => onQuerySelect(query)}
            className="text-sm px-4 py-3 rounded-xl transition-all duration-200 hover:scale-[1.02] hover:shadow-soft active:scale-95 text-left bg-white border border-neutral-200 hover:border-primary-light hover:bg-primary-50"
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