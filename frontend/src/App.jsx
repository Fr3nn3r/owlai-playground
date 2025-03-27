import { useState, useEffect, useRef } from "react";
import AgentSelector from "./components/AgentSelector";
import QuestionInput from "./components/QuestionInput";
import ResponseDisplay from "./components/ResponseDisplay";
import LoadingSpinner from "./components/LoadingSpinner";
import ErrorMessage from "./components/ErrorMessage";
import DefaultQueries from "./components/DefaultQueries";
import TypingIndicator from "./components/TypingIndicator";
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
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  const { API_URL } = config;

  // Get current conversation for selected agent
  const currentConversation = selectedAgent ? conversations[selectedAgent.id] || [] : [];

  // Update conversation when question is edited
  useEffect(() => {
    if (!question || !selectedAgent) return;

    const currentMessages = conversations[selectedAgent.id] || [];
    const lastMessage = currentMessages[currentMessages.length - 1];
    
    // If last message is from user and hasn't been responded to yet, update it
    if (lastMessage && lastMessage.role === 'user' && 
        (!currentMessages[currentMessages.length - 2] || 
         currentMessages[currentMessages.length - 2].role === 'user')) {
      setConversations(prev => ({
        ...prev,
        [selectedAgent.id]: [
          ...currentMessages.slice(0, -1),
          { role: 'user', content: question }
        ]
      }));
    }
  }, [question, selectedAgent]);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    const chatContainer = document.querySelector('.chat-messages-container');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation]);

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
    setError("");
    setIsTyping(true); // Show waiting box until first streaming characters arrive
    
    try {
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
      let isFirstChunk = true;

      // Add user message to conversation only if it's not already there
      setConversations(prev => {
        const currentMessages = prev[selectedAgent.id] || [];
        const lastMessage = currentMessages[currentMessages.length - 1];
        
        // If the last message is already from the user with the same content, don't add it again
        if (lastMessage && lastMessage.role === 'user' && lastMessage.content === question) {
          return prev;
        }
        
        return {
          ...prev,
          [selectedAgent.id]: [
            ...currentMessages,
            { role: 'user', content: question }
          ]
        };
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            streamedResponse += data.content;
            
            // Hide waiting box after first chunk is received
            if (isFirstChunk) {
              setIsTyping(false);
              isFirstChunk = false;
            }
            
            // Update conversation with streaming response
            setConversations(prev => {
              const currentMessages = prev[selectedAgent.id] || [];
              const lastMessage = currentMessages[currentMessages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant') {
                // Update existing assistant message
                return {
                  ...prev,
                  [selectedAgent.id]: [
                    ...currentMessages.slice(0, -1),
                    { role: 'assistant', content: streamedResponse }
                  ]
                };
              } else {
                // Add new assistant message
                return {
                  ...prev,
                  [selectedAgent.id]: [
                    ...currentMessages,
                    { role: 'assistant', content: streamedResponse }
                  ]
                };
              }
            });
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
      setIsTyping(false);
    }
  };

  const handleQuerySelect = (query) => {
    setQuestion(query);
    // Add or update user message in conversation
    setConversations(prev => {
      const currentMessages = prev[selectedAgent.id] || [];
      const lastMessage = currentMessages[currentMessages.length - 1];
      
      // If last message is from user, update it
      if (lastMessage && lastMessage.role === 'user') {
        return {
          ...prev,
          [selectedAgent.id]: [
            ...currentMessages.slice(0, -1),
            { role: 'user', content: query }
          ]
        };
      }
      
      // Otherwise add new message
      return {
        ...prev,
        [selectedAgent.id]: [
          ...currentMessages,
          { role: 'user', content: query }
        ]
      };
    });
  };

  const handleStreamSubmit = async () => {
    if (!question || !selectedAgent) return;
  
    setLoadingQuery(true);
    setError("");
    
    try {
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

      // Add user message to conversation only if it's not already there
      setConversations(prev => {
        const currentMessages = prev[selectedAgent.id] || [];
        const lastMessage = currentMessages[currentMessages.length - 1];
        
        // If the last message is already from the user with the same content, don't add it again
        if (lastMessage && lastMessage.role === 'user' && lastMessage.content === question) {
          return prev;
        }
        
        return {
          ...prev,
          [selectedAgent.id]: [
            ...currentMessages,
            { role: 'user', content: question }
          ]
        };
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            streamedResponse += data.content;
            
            // Update conversation with streaming response
            setConversations(prev => {
              const currentMessages = prev[selectedAgent.id] || [];
              const lastMessage = currentMessages[currentMessages.length - 1];
              
              if (lastMessage && lastMessage.role === 'assistant') {
                // Update existing assistant message
                return {
                  ...prev,
                  [selectedAgent.id]: [
                    ...currentMessages.slice(0, -1),
                    { role: 'assistant', content: streamedResponse }
                  ]
                };
              } else {
                // Add new assistant message
                return {
                  ...prev,
                  [selectedAgent.id]: [
                    ...currentMessages,
                    { role: 'assistant', content: streamedResponse }
                  ]
                };
              }
            });
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
          <div className="lg:w-25 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200">
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
          <div className="lg:w-20 p-6 border-b lg:border-b-0 lg:border-r border-neutral-200 flex flex-col">
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
          <div className="lg:w-55 flex flex-col flex-1 relative">
            {/* Fixed Background Container */}
            <div className="absolute inset-0 bg-neutral-50">
              {/* Background Owl - Fixed */}
              {selectedAgent && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <img
                    src={selectedAgent.owl_image_url || '/owl-default.jpg'}
                    alt={`${selectedAgent.name} owl background`}
                    className="w-[90%] h-[90%] object-contain"
                    onError={(e) => {
                      console.error('Failed to load background owl image:', {
                        agentId: selectedAgent.id,
                        agentName: selectedAgent.name,
                        attemptedUrl: selectedAgent.owl_image_url,
                        fallbackUrl: '/owl-default.jpg',
                        timestamp: new Date().toISOString()
                      });
                      e.target.src = '/owl-default.jpg';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Scrollable Chat Container */}
            <div className="relative flex-1 overflow-y-auto">
              {/* Loading Overlay */}
              {loadingQuery && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-50 z-10">
                  <LoadingSpinner />
                </div>
              )}

              {/* Chat Messages */}
              <div className="p-6 space-y-4 relative z-20 pb-40 chat-messages-container">
                {currentConversation.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`p-4 rounded-xl shadow-soft animate-fadeInUp ${
                      msg.role === 'user' 
                        ? 'ml-4 bg-white border-2 border-primary/20 shadow-hover' 
                        : 'mr-4 bg-white/70 backdrop-blur-sm border border-neutral-200'
                    }`}
                    style={{
                      animationDelay: `${index * 50}ms`,
                      transform: 'scale(1)',
                      opacity: 1,
                    }}
                  >
                    <div 
                      className="font-semibold mb-1 flex items-center gap-2"
                      style={{
                        color: msg.role === 'user' 
                          ? '#2563EB' 
                          : '#374151'
                      }}
                    >
                      {msg.role === 'user' ? (
                        <>
                          <span className="text-primary">You</span>
                          <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">Question</span>
                        </>
                      ) : (
                        selectedAgent?.name
                      )}
                    </div>
                    <div className={`whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user' 
                        ? 'text-neutral-900 font-medium' 
                        : 'text-neutral-700'
                    }`}>{msg.content}</div>
                  </div>
                ))}
                {isTyping && (
                  <div className="ml-4 bg-white/70 p-4 rounded-xl shadow-soft animate-fadeIn border border-neutral-200">
                    <div className="font-semibold mb-1 text-neutral-700">{selectedAgent?.name}</div>
                    <TypingIndicator />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
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
  );
}

export default App;
