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
    const AGENT_API_URL = "https://owlai-backend.onrender.com/agents";
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
        setAgents(data);
        setSelectedAgent(data[0]?.id || "");
      })
      .catch((err) => {
        console.error("❌ Failed to fetch agents:", err);
        setError("Failed to load agents. Please try again later.");
      })
      .finally(() => setLoadingAgents(false));
  }, []);

  
  const handleSubmit = async () => {
    if (!question || !selectedAgent) return;
  
    setResponse("Loading...");
    try {
      const res = await fetch("https://owlai-backend.onrender.com/query", {
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
  className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded-lg w-full transition-colors"
>
  Submit
</button>
      <ResponseDisplay response={response} />
    </div>
  </div>
  );
}

export default App;
