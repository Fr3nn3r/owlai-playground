import { useState, useEffect } from "react";
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const AGENT_API_URL = `${API_URL}/agents`;
    console.log("📡 Fetching agents from:", AGENT_API_URL);

    setLoadingAgents(true);
    setError("");

    fetch(AGENT_API_URL)
      .then((res) => {
        console.log("🔁 Agent fetch response:", res.status);
        return res.json();
      })
      .then((data) => {
        console.log("✅ Agent list received:", data);
        if (!Array.isArray(data) || !data.length) {
          throw new Error("No agents returned from backend.");
        }
        setAgents(data);
        setSelectedAgent(data[0].id);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch agents:", err);
        setError("❌ Could not load agents. Please check your backend.");
      })
      .finally(() => setLoadingAgents(false));
  }, [API_URL]);
  
  const handleSubmit = async () => {
    if (!question || !selectedAgent) return;
  
    setLoadingQuery(true);
    setResponse("Loading...");
    setError("");
    try {
      const res = await fetch(`${API_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, agent_id: selectedAgent }),
      });
  
      if (!res.ok) throw new Error("Query failed.");
      const data = await res.json();
      setResponse(data.answer);
    } catch (error) {
      console.error("Error querying agent:", error);
      setError("❌ Could not fetch agent response.");
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoadingQuery(false);
    }
  };
  

  return (

<div className="min-h-screen bg-pink-50 text-gray-900 p-6">
  <div className="max-w-xl mx-auto bg-white shadow-xl p-6 rounded-2xl space-y-4">

    <div className="flex flex-col items-center space-y-2">
      <img src="/owl-default.jpg" alt="Owl Agent" className="w-32 h-32 rounded-full shadow-md" />
      <h1 className="text-3xl font-bold text-center text-pink-600">Posez une question de droit à Marianne</h1>
    </div>

      <AgentSelector agents={agents} selectedAgent={selectedAgent} setSelectedAgent={setSelectedAgent} />
      <QuestionInput question={question} setQuestion={setQuestion} />
      <button
  onClick={handleSubmit}
  disabled={loadingQuery}
  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg w-full transition-colors disabled:opacity-50"
>
  {loadingQuery ? "Thinking..." : "Submit"}
</button>
      <ResponseDisplay response={response} />
    </div>
  </div>
  );
}

export default App;
