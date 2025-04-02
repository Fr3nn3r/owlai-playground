import React from 'react';
import PropTypes from 'prop-types';

const QuestionInput = ({ value, onChange, onSubmit, disabled, placeholder, style }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || "Type your question here... (Press Enter to submit)"}
        className="flex-1 p-3 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        style={{
          minHeight: '60px',
          maxHeight: '200px',
          ...style
        }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed h-[60px] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

QuestionInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  placeholder: PropTypes.string,
  style: PropTypes.object,
};

export default QuestionInput;
