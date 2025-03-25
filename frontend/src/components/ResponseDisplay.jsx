export default function ResponseDisplay({ response }) {
  return (
    <div className="mt-4 p-4 border rounded bg-gray-100">
      <strong>Agent Response:</strong>
      <p>{response || "Waiting for response..."}</p>
    </div>
  );
}
