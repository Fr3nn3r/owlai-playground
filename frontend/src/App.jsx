import { useState, useEffect } from "react";
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import DefaultQueries from "./components/DefaultQueries";

function App() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState({});
  const [defaultQueries, setDefaultQueries] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  // Get current conversation for selected agent
  const currentConversation = selectedAgent ? conversations[selectedAgent.id] || [] : [];

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
        setSelectedAgent(data[0]);
        // Initialize empty conversations for each agent
        const initialConversations = data.reduce((acc, agent) => {
          acc[agent.id] = [];
          return acc;
        }, {});
        setConversations(initialConversations);
      })
      .catch((err) => {
        console.error("❌ Failed to fetch agents:", err);
        setError("❌ Could not load agents. Please check your backend.");
      })
      .finally(() => setLoadingAgents(false));
  }, [API_URL]);

  // Fetch default queries when agent is selected
  useEffect(() => {
    if (!selectedAgent) return;

    const fetchDefaultQueries = async () => {
      try {
        const response = await fetch(`${API_URL}/agents/${selectedAgent.id}/default-queries`);
        if (!response.ok) throw new Error("Failed to fetch default queries");
        const queries = await response.json();
        setDefaultQueries(queries);
      } catch (err) {
        console.error("Failed to fetch default queries:", err);
        setDefaultQueries([]);
      }
    };

    fetchDefaultQueries();
  }, [selectedAgent, API_URL]);
  
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
        body: JSON.stringify({ question, agent_id: selectedAgent.id }),
      });
  
      if (!res.ok) throw new Error("Query failed.");
      const data = await res.json();
      setResponse(data.answer);
      
      // Add to conversation history for the current agent
      setConversations(prev => ({
        ...prev,
        [selectedAgent.id]: [
          ...(prev[selectedAgent.id] || []),
          { role: 'user', content: question },
          { role: 'assistant', content: data.answer }
        ]
      }));
      setQuestion(''); // Clear input after successful submission
    } catch (error) {
      console.error("Error querying agent:", error);
      setError("❌ Could not fetch agent response.");
      setResponse("Something went wrong. Please try again.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleQuerySelect = (query) => {
    setQuestion(query);
    handleSubmit();
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-900 p-6"
      style={selectedAgent ? {
        background: `linear-gradient(to bottom, ${selectedAgent.color_theme.primary}10, white)`
      } : {}}
    >
      <div className="max-w-4xl mx-auto bg-white shadow-xl p-8 rounded-2xl space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {selectedAgent && (
            <h1 
              className="text-3xl font-bold text-center"
              style={{ color: selectedAgent.color_theme.primary }}
            >
              {selectedAgent.welcome_title}
            </h1>
          )}
        </div>

        {loadingAgents ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <ErrorMessage 
            message={error} 
            onRetry={() => window.location.reload()} 
          />
        ) : (
          <>
            <AgentSelector 
              agents={agents} 
              selectedAgent={selectedAgent} 
              onSelect={setSelectedAgent}
              className="mb-6" 
            />

            <DefaultQueries 
              queries={defaultQueries}
              onQuerySelect={handleQuerySelect}
              selectedAgent={selectedAgent}
            />

            <div className="sticky top-4 bg-white p-4 shadow-md rounded-lg z-10">
              <QuestionInput 
                question={question} 
                setQuestion={setQuestion}
                onSubmit={handleSubmit}
                style={selectedAgent ? {
                  borderColor: selectedAgent.color_theme.secondary
                } : {}}
              />
              <button
                onClick={handleSubmit}
                disabled={loadingQuery || !question || !selectedAgent}
                className="mt-2 px-6 py-3 rounded-lg w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-white"
                style={{
                  backgroundColor: selectedAgent ? selectedAgent.color_theme.primary : '#666',
                }}
              >
                {loadingQuery ? (
                  <div className="flex items-center justify-center space-x-2">
                    <LoadingSpinner />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  "Ask Question"
                )}
              </button>
            </div>

            {/* Conversation History */}
            <div className="mt-6 space-y-4">
              {currentConversation.map((msg, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-lg ${
                    msg.role === 'user' 
                      ? 'ml-4' 
                      : 'mr-4'
                  }`}
                  style={{
                    backgroundColor: msg.role === 'user' 
                      ? (selectedAgent?.color_theme.primary + '10') 
                      : '#f8f9fa'
                  }}
                >
                  <div 
                    className="font-semibold mb-1"
                    style={{
                      color: msg.role === 'user' 
                        ? selectedAgent?.color_theme.primary 
                        : '#666'
                    }}
                  >
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
