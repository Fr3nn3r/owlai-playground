import { useState, useEffect, useRef } from "react";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import DefaultQueries from "./DefaultQueries";
import TypingIndicator from "./TypingIndicator";
import FeedbackComponent from "./FeedbackComponent";
import ChunkViewer from "./ChunkViewer";
import ShareButtons from "./ShareButtons";
import MetaTags from "./MetaTags";
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
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const { API_URL } = config;

  // Fetch default agent on mount
  useEffect(() => {
    const fetchDefaultAgent = async () => {
      try {
        const response = await fetch(`${API_URL}/default-agent`);
        if (!response.ok) throw new Error("Échec du chargement de l'agent");
        const data = await response.json();
        setAgent(data);
        setDefaultQueries(data.default_queries);
      } catch (err) {
        console.error("Échec du chargement des données de l'agent:", err);
        setError("Impossible de charger l'agent. Veuillez réessayer plus tard.");
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
        console.error("Échec du chargement de la version:", err);
      }
    };

    fetchDefaultAgent();
    fetchVersion();
  }, [API_URL]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const fetchChunks = async (queryId) => {
    setLoadingChunks(true);
    try {
      const response = await fetch(`${API_URL}/query/${queryId}/chunks`);
      if (!response.ok) throw new Error('Échec du chargement des extraits');
      const data = await response.json();
      setChunks(data);
    } catch (error) {
      console.error('Erreur lors du chargement des extraits:', error);
      setChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    setLoadingQuery(true);
    setError("");
    setIsTyping(true);
    setResponse("");
    setChunks([]);
    
    try {
      const queryId = `${agent.id}-${Date.now()}`;
      const response = await fetch(`${API_URL}/stream-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          agent_id: agent.id,
        }),
      });

      if (!response.ok) throw new Error('Échec de la requête');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedResponse = "";
      let isFirstChunk = true;

      // Add user message to conversation
      setConversations(prev => [...prev, {
        id: queryId,
        question,
        answer: "",
        timestamp: new Date().toISOString(),
      }]);

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
              const lastConversation = newConversations[newConversations.length - 1];
              if (lastConversation) {
                lastConversation.answer = streamedResponse;
              }
              return newConversations;
            });

            // Update current response
            setResponse(streamedResponse);
          }
        }
      }

      // Fetch chunks after getting the complete response
      await fetchChunks(queryId);
      
    } catch (err) {
      console.error("Erreur:", err);
      setError("Échec de la réponse. Veuillez réessayer.");
    } finally {
      setLoadingQuery(false);
      setIsTyping(false);
      setQuestion("");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!agent) return <ErrorMessage message="Aucun agent disponible" />;

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <MetaTags
        title={response ? `OwlAI - ${question}` : undefined}
        description={response ? `${response.slice(0, 150)}...` : undefined}
      />
      {/* Single owl background for entire page */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("/owl-default.jpg")',
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.9,
          zIndex: 0
        }}
      />

      {/* Main content container */}
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel - Suggested queries */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Questions Suggérées</h2>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <DefaultQueries
                  queries={defaultQueries}
                  onQuerySelect={query => {
                    setQuestion(query);
                    handleSubmit();
                  }}
                  selectedAgent={agent}
                />
              </div>
            </div>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-6">
            <div className="bg-white/60 rounded-lg shadow-sm p-6 mb-6 min-h-[600px]">
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-4">{agent?.welcome_title || "Chargement..."}</h1>
                <p className="text-gray-600 mb-6">{agent?.description}</p>
                
                <QuestionInput
                  value={question}
                  onChange={setQuestion}
                  onSubmit={handleSubmit}
                  placeholder="Posez votre question..."
                  disabled={loadingQuery}
                />

                {loadingQuery && !response && (
                  <div className="flex justify-center my-8">
                    <LoadingSpinner />
                  </div>
                )}

                {error && (
                  <div className="text-red-500 my-4">
                    {error === "Échec de la réponse. Veuillez réessayer." 
                      ? "Échec de la réponse. Veuillez réessayer."
                      : error}
                  </div>
                )}

                {response && (
                  <div className="mt-6">
                    <div className="bg-gray-50/60 rounded-lg p-4">
                      <p className="whitespace-pre-wrap">{response}</p>
                      {isTyping && <TypingIndicator />}
                      <div className="mt-4">
                        <FeedbackComponent
                          queryId={conversations[conversations.length - 1]?.id}
                          agentId={agent?.id}
                        />
                      </div>
                    </div>
                    {!isTyping && (
                      <ShareButtons
                        question={question}
                        response={response}
                        queryId={conversations[conversations.length - 1]?.id}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Previous conversations */}
            <div className="space-y-4">
              {conversations.slice(0, -1).reverse().map((conv) => (
                <div key={conv.id} className="bg-white/60 rounded-lg shadow-sm p-6">
                  <div className="relative z-10">
                    <div className="font-medium mb-2">{conv.question}</div>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {conv.answer}
                    </div>
                    <div className="mt-4">
                      <FeedbackComponent
                        queryId={conv.id}
                        agentId={agent?.id}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel - Document chunks */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 rounded-lg shadow-sm p-6 sticky top-4">
              <ChunkViewer
                chunks={chunks}
                isLoading={loadingChunks}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleAgentPage; 