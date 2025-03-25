import { useState, useEffect } from "react";
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    // TEMP: Mock agents
    const fakeAgents = [
      { id: "agent1", name: "Agent Alpha" },
      { id: "agent2", name: "Agent Beta" },
    ];
    setAgents(fakeAgents);
    setSelectedAgent(fakeAgents[0].id);
  }, []);

  const handleSubmit = async () => {
    setResponse("This is a mock response for: " + question);
    // Replace with actual fetch later
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">OwlAI Agent Playground</h1>
      <AgentSelector agents={agents} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />
      <QuestionInput question={question} setQuestion={setQuestion} />
      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-2 rounded">
        Submit
      </button>
      <ResponseDisplay response={response} />
    </div>
  );
}

export default App;
