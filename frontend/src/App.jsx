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
    fetch("http://localhost:8000/agents")
      .then((res) => res.json())
      .then((data) => {
        setAgents(data);
        setSelectedAgent(data[0]?.id || "");
      })
      .catch((err) => {
        console.error("Failed to fetch agents", err);
      });
  }, []);
  
  const handleSubmit = async () => {
    if (!question || !selectedAgent) return;
  
    setResponse("Loading...");
    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, agent_id: selectedAgent }),
      });
  
      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      console.error("Error querying agent:", error);
      setResponse("Something went wrong. Please try again.");
    }
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
