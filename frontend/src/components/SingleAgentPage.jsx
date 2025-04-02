import { useState, useEffect, useRef } from "react";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import DefaultQueries from "./DefaultQueries";
import TypingIndicator from "./TypingIndicator";
import config from "../config";

function SingleAgentPage() {
  const [agent, setAgent] = useState(null);
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState([]);
  const [defaultQueries, setDefaultQueries] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [version, setVersion] = useState(null);
  const chatEndRef = useRef(null);

  const { API_URL } = config;

  // Fetch default agent on mount
  useEffect(() => {
    const fetchDefaultAgent = async () => {
      try {
        const response = await fetch(`${API_URL}/default-agent`);
        if (!response.ok) throw new Error("Failed to fetch default agent");
        const data = await response.json();
        setAgent(data);
        
        // Fetch default queries for the agent
        const queriesResponse = await fetch(`${API_URL}/agents/${data.id}/default-queries`);
        if (!queriesResponse.ok) throw new Error("Failed to fetch default queries");
        const queries = await queriesResponse.json();
        setDefaultQueries(queries);
      } catch (err) {
        console.error("Failed to fetch agent data:", err);
        setError("Could not load the agent. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    const fetchVersion = async () => {
      try {
        const response = await fetch(`${API_URL}/version`);
        if (response.ok) {
          const data = await response.json();
          setVersion(data.version);
        }
      } catch (err) {
        console.error("Failed to fetch version:", err);
      }
    };

    fetchDefaultAgent();
    fetchVersion();
  }, [API_URL]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const handleSubmit = async () => {
    if (!question || !agent) return;

    setLoadingQuery(true);
    setError("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/stream-query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, agent_id: agent.id }),
      });

      if (!response.ok) throw new Error("Stream query failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";
      let isFirstChunk = true;

      // Add user message to conversation
      setConversations(prev => [...prev, { role: 'user', content: question }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            streamedResponse += data.content;

            if (isFirstChunk) {
              setIsTyping(false);
              isFirstChunk = false;
            }

            // Update conversation with streaming response
            setConversations(prev => {
              const newConversations = [...prev];
              if (newConversations[newConversations.length - 1]?.role === 'assistant') {
                newConversations[newConversations.length - 1].content = streamedResponse;
              } else {
                newConversations.push({ role: 'assistant', content: streamedResponse });
              }
              return newConversations;
            });
          }
        }
      }
    } catch (err) {
      console.error("Query failed:", err);
      setError("Failed to get response. Please try again.");
    } finally {
      setLoadingQuery(false);
      setIsTyping(false);
      setQuestion("");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!agent) return <ErrorMessage message="No agent available" />;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Version display */}
      {version && (
        <div className="text-sm text-gray-500 mb-4">
          Version: {version}
        </div>
      )}

      {/* Agent header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: agent.color_theme.primary }}>
          {agent.welcome_title}
        </h1>
        <p className="text-gray-600">{agent.description}</p>
      </div>

      {/* Chat interface */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {/* Conversation history */}
          <div className="mb-6 max-h-[500px] overflow-y-auto chat-messages-container">
            {conversations.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-4 ${
                  msg.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Question input */}
          <QuestionInput
            value={question}
            onChange={setQuestion}
            onSubmit={handleSubmit}
            disabled={loadingQuery}
            placeholder="Ask your question..."
          />
        </div>

        {/* Default queries */}
        <DefaultQueries
          queries={defaultQueries}
          onSelectQuery={query => {
            setQuestion(query);
            handleSubmit();
          }}
        />
      </div>
    </div>
  );
}

export default SingleAgentPage; 