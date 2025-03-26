import { useState, useEffect } from "react";
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import DefaultQueries from "./components/DefaultQueries";
import config from "./config";

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

  const { API_URL } = config;

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
        if (!res.ok) throw new Error("Failed to fetch agents");
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
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <div className="max-w-[1920px] mx-auto bg-white shadow-soft rounded-xl overflow-hidden animate-fadeInUp">
        <div className="flex flex-col lg:flex-row h-screen">
          {/* Column 1: Agent Selection & Owl Visual (25%) */}
          <div className="lg:w-25 p-6 border-r border-neutral-200 overflow-y-auto lg:h-screen lg:sticky lg:top-0">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight mb-6 text-neutral-800">Select an Agent</h2>
              
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
                <AgentSelector 
                  agents={agents} 
                  selectedAgent={selectedAgent} 
                  onSelect={setSelectedAgent}
                  className="space-y-4" 
                />
              )}
            </div>
          </div>

          {/* Column 2: Default Questions (20%) */}
          <div className="lg:w-20 p-6 border-r border-neutral-200 overflow-y-auto lg:h-screen lg:sticky lg:top-0">
            {selectedAgent && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-800">Suggested Questions</h3>
                <DefaultQueries 
                  queries={defaultQueries}
                  onQuerySelect={handleQuerySelect}
                  selectedAgent={selectedAgent}
                />
              </div>
            )}
          </div>

          {/* Column 3: Chat Area (55%) */}
          <div className="lg:w-55 flex flex-col flex-1 relative">
            {/* Hero Owl Section */}
            <div className="relative h-48 lg:h-64 bg-gradient-to-b from-neutral-50 to-white p-6 flex items-center justify-center">
              {selectedAgent && (
                <div className="relative w-32 h-32 lg:w-48 lg:h-48 animate-float">
                  <img
                    src={selectedAgent.owl_image_url || '/owl-default.jpg'}
                    alt={`${selectedAgent.name} owl`}
                    className="w-full h-full rounded-full object-cover shadow-soft"
                  />
                  {loadingQuery && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
                      <LoadingSpinner />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="flex-1 p-6 overflow-y-auto bg-neutral-50 pb-32">
              <div className="space-y-4">
                {currentConversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl shadow-soft animate-fadeIn ${
                      msg.role === 'user' 
                        ? 'ml-4 bg-primary-50' 
                        : 'mr-4 bg-white'
                    }`}
                  >
                    <div 
                      className="font-semibold mb-1"
                      style={{
                        color: msg.role === 'user' 
                          ? '#2563EB' 
                          : '#374151'
                      }}
                    >
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-neutral-700">{msg.content}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Section - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-soft z-50">
              <div className="max-w-[1920px] mx-auto">
                <div className="lg:ml-[45%] p-4">
                  <div className="max-w-3xl">
                    <QuestionInput 
                      question={question} 
                      setQuestion={setQuestion}
                      onSubmit={handleSubmit}
                      style={{
                        borderColor: '#E5E7EB',
                        '&:focus': {
                          borderColor: '#2563EB',
                          boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.1)',
                        }
                      }}
                    />
                    <button
                      onClick={handleSubmit}
                      disabled={loadingQuery || !question || !selectedAgent}
                      className="mt-2 px-6 py-3 rounded-xl w-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft hover:shadow-hover text-white font-medium bg-primary hover:bg-primary-dark active:scale-95"
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
