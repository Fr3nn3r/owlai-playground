import React from 'react';
import PropTypes from 'prop-types';

const QuestionInput = ({ question, setQuestion, onSubmit, style }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      onKeyPress={handleKeyPress}
      placeholder="Type your question here... (Press Enter to submit)"
      className="w-full p-3 border-2 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all duration-200"
      style={{
        minHeight: '60px',
        maxHeight: '200px',
        ...style
      }}
    />
  );
};

QuestionInput.propTypes = {
  question: PropTypes.string.isRequired,
  setQuestion: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  style: PropTypes.object,
};

export default QuestionInput;
