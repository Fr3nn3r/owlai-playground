import { useState, useEffect, useRef } from "react";
import AgentSelector from "./AgentSelector";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import DefaultQueries from "./DefaultQueries";
import TypingIndicator from "./TypingIndicator";
import FeedbackComponent from "./FeedbackComponent";
import config from "../config";

function Playground() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState({});
  const [defaultQueries, setDefaultQueries] = useState([]);
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

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

  const handleQuerySelect = (query) => {
    // Only set the question in the input field, nothing else
    setQuestion(query);
  };

  // Remove any effects that watch question changes
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
    if (!question || !selectedAgent || loadingQuery) return;

    setLoadingQuery(true);
    setError("");
    
    try {
      // Add user message to conversation
      setConversations(prev => ({
        ...prev,
        [selectedAgent.id]: [
          ...(prev[selectedAgent.id] || []),
          { role: 'user', content: question }
        ]
      }));

      const response = await fetch(`${API_URL}/stream-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, agent_id: selectedAgent.id }),
      });

      if (!response.ok) throw new Error("Stream query failed.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              streamedResponse += data.content;
              
              // Update conversation with the current streamed response
              setConversations(prev => {
                const currentConv = prev[selectedAgent.id] || [];
                const lastMsg = currentConv[currentConv.length - 1];
                
                if (lastMsg && lastMsg.role === 'assistant') {
                  // Update existing assistant message
                  return {
                    ...prev,
                    [selectedAgent.id]: [
                      ...currentConv.slice(0, -1),
                      { ...lastMsg, content: streamedResponse }
                    ]
                  };
                } else {
                  // Add new assistant message
                  return {
                    ...prev,
                    [selectedAgent.id]: [
                      ...currentConv,
                      { role: 'assistant', content: streamedResponse }
                    ]
                  };
                }
              });
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
      
      setQuestion(''); // Clear input after successful submission
    } catch (error) {
      console.error("Error streaming agent response:", error);
      setError("❌ Could not fetch agent response.");
      setConversations(prev => ({
        ...prev,
        [selectedAgent.id]: [
          ...(prev[selectedAgent.id] || []),
          { role: 'assistant', content: "Something went wrong. Please try again." }
        ]
      }));
    } finally {
      setLoadingQuery(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white text-neutral-900">
      <div className="max-w-[1920px] mx-auto bg-white shadow-soft rounded-xl overflow-hidden animate-fadeInUp">
        {/* Main Container - Fixed height */}
        <div className="flex flex-col lg:flex-row h-screen">
          {/* Left Column - Agent Selection (25%) - Fixed */}
          <div className="lg:w-1/4 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200">
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

          {/* Middle Column - Default Questions (20%) - Fixed */}
          <div className="lg:w-1/5 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col">
            {selectedAgent && (
              <div className="space-y-6 flex flex-col h-full">
                <h3 className="text-xl font-semibold tracking-tight text-neutral-800">Suggested Questions</h3>
                <div className="flex-1 overflow-y-auto">
                  <DefaultQueries 
                    queries={defaultQueries}
                    onQuerySelect={handleQuerySelect}
                    selectedAgent={selectedAgent}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Chat Area (55%) - Scrollable */}
          <div className="lg:flex-1 flex flex-col relative">
            {/* Fixed Background Container */}
            <div className="absolute inset-0 bg-neutral-50/80">
              {/* Background Owl - Fixed */}
              {selectedAgent && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
                  <img
                    src={selectedAgent.owl_image_url?.startsWith('/') 
                      ? selectedAgent.owl_image_url.replace(/^\/public/, '')
                      : `/${selectedAgent.owl_image_url?.replace(/^public\//, '') || 'owl-default.jpg'}`
                    }
                    alt={`${selectedAgent.name} owl background`}
                    className="w-[90%] h-[90%] object-contain"
                    onError={(e) => {
                      e.target.src = '/owl-default.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Scrollable Chat Container */}
            <div className="relative flex-1 overflow-y-auto">
              {/* Chat Messages */}
              <div className="p-6 space-y-4 relative z-20 pb-40 chat-messages-container">
                {currentConversation.length === 0 ? (
                  <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet. Start by asking a question!</p>
                  </div>
                ) : (
                  currentConversation.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`p-4 rounded-xl shadow-sm transition-all ${
                        msg.role === 'user' 
                          ? 'ml-auto mr-4 bg-primary/5 border border-primary/20 max-w-[80%]' 
                          : 'ml-4 mr-auto bg-white border border-neutral-200 max-w-[80%]'
                      }`}
                    >
                      <div 
                        className="font-semibold mb-2 flex items-center gap-2"
                        style={{
                          color: msg.role === 'user' ? '#2563EB' : '#374151'
                        }}
                      >
                        {msg.role === 'user' ? (
                          <>
                            <span className="text-primary">You</span>
                            <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">Question</span>
                          </>
                        ) : (
                          <>
                            <span>{selectedAgent?.name}</span>
                            <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full">Response</span>
                          </>
                        )}
                      </div>
                      <div className={`whitespace-pre-wrap leading-relaxed ${
                        msg.role === 'user' 
                          ? 'text-neutral-900' 
                          : 'text-neutral-800'
                      }`}>
                        {msg.content}
                      </div>
                      {msg.role === 'assistant' && !loadingQuery && (
                        <div className="mt-4 pt-4 border-t border-neutral-100">
                          <FeedbackComponent
                            queryId={`${selectedAgent.id}-${index}`}
                            agentId={selectedAgent.id}
                            onFeedbackSubmitted={() => {
                              console.log('Feedback submitted for message:', index);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {loadingQuery && (
                  <div className="ml-4 mr-auto bg-white border border-neutral-200 p-4 rounded-xl shadow-sm animate-pulse max-w-[80%]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 w-20 bg-gray-200 rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input Section - Fixed at bottom */}
            <div className="sticky bottom-0 bg-white border-t border-neutral-200 shadow-md z-50">
              <div className="p-4">
                <div className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <div className="flex-1">
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
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={loadingQuery || !question || !selectedAgent}
                      className="px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md text-white font-medium bg-primary hover:bg-primary-dark active:scale-95 whitespace-nowrap"
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

export default Playground; 