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
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      placeholder={placeholder || "Type your question here... (Press Enter to submit)"}
      className="w-full p-3 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
      style={{
        minHeight: '60px',
        maxHeight: '200px',
        ...style
      }}
    />
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
