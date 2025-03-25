export default function AgentSelector({ agents, selectedAgent, setSelectedAgent }) {
  return (
    <select
      className="border-2 border-pink-300 p-2 rounded w-full"
      value={selectedAgent}
      onChange={(e) => setSelectedAgent(e.target.value)}
    >
      {agents.map((agent) => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
}
