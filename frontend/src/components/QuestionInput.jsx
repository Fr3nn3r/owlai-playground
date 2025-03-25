export default function QuestionInput({ question, setQuestion }) {
  return (
    <textarea
      className="border p-2 w-full rounded resize-none"
      rows="4"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="Ask a legal question..."
    />
  );
}
