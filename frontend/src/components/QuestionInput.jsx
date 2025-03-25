export default function QuestionInput({ question, setQuestion, onSubmit }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <textarea
      className="border-2 border-pink-300 p-2 w-full rounded resize-none"
      rows="4"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Ask a legal question... (Press Enter to submit)"
    />
  );
}
