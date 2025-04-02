import { useState, useEffect, useRef } from "react";
import QuestionInput from "./QuestionInput";
import ResponseDisplay from "./ResponseDisplay";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import DefaultQueries from "./DefaultQueries";
import TypingIndicator from "./TypingIndicator";
import FeedbackComponent from "./FeedbackComponent";
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

  const handleSubmit = async () => {
    if (!question.trim()) return;
    
    console.log('🚀 Starting submission with question:', question);
    setLoadingQuery(true);
    setError("");
    setIsTyping(true);
    setResponse("");
    
    try {
      const queryId = `${agent.id}-${Date.now()}`;
      const currentQuestion = question;
      
      // Add user message to conversation
      setConversations(prev => {
        const newConv = [...prev, {
          id: queryId,
          question: currentQuestion,
          answer: "",
          timestamp: new Date().toISOString(),
        }];
        console.log('💬 Current conversations:', newConv);
        return newConv;
      });

      console.log('🌐 Making API request to:', `${API_URL}/stream-query`);
      const response = await fetch(`${API_URL}/stream-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          agent_id: agent.id,
          query_id: queryId
        }),
      });

      console.log('📨 Server response status:', response.status);
      if (!response.ok) throw new Error('Échec de la requête');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Decode the chunk and split into lines
        const chunk = decoder.decode(value, { stream: true });
        console.log('📦 Received chunk:', chunk);
        
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              console.log('📄 Processing line:', jsonStr);
              
              const data = JSON.parse(jsonStr);
              console.log('🔍 Parsed data:', data);
              
              if (data.content) {
                accumulatedResponse += data.content;
                console.log('📝 Updated response length:', accumulatedResponse.length);
                
                // Update both states
                setResponse(accumulatedResponse);
                setConversations(prev => 
                  prev.map(conv => 
                    conv.id === queryId 
                      ? { ...conv, answer: accumulatedResponse }
                      : conv
                  )
                );
              }
            } catch (e) {
              console.error('❌ Error processing line:', e);
              console.error('Problem line:', line);
            }
          } else {
            console.warn('⚠️ Unexpected line format:', line);
          }
        }
      }

      console.log('✅ Finished streaming response');
      
    } catch (err) {
      console.error("❌ Error during submission:", err);
      setError("Échec de la réponse. Veuillez réessayer.");
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === queryId 
            ? { ...conv, answer: "Une erreur s'est produite. Veuillez réessayer." }
            : conv
        )
      );
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
        <div className="grid grid-cols-1 lg:grid-cols-9 gap-8">
          {/* Left panel - Suggested queries */}
          <div className="lg:col-span-3">
            <div className="bg-white/60 rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Questions Suggérées</h2>
              <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
                <DefaultQueries
                  queries={defaultQueries}
                  onQuerySelect={query => setQuestion(query)}
                  selectedAgent={agent}
                />
              </div>
            </div>
          </div>

          {/* Main content area - now wider */}
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

                {/* Current conversation */}
                <div className="mt-6 space-y-4">
                  {conversations.length > 0 && (
                    console.log('🎯 Rendering conversations:', conversations),
                    conversations.map((conv, index) => (
                      <div key={conv.id} className="bg-white/60 rounded-lg shadow-sm p-4">
                        <div className="font-medium mb-2">
                          {console.log('📄 Rendering question:', conv.question)}
                          {conv.question}
                        </div>
                        {conv.answer && (
                          <div className="bg-gray-50/60 rounded-lg p-4">
                            {console.log('📄 Rendering answer:', conv.answer)}
                            <p className="whitespace-pre-wrap">{conv.answer}</p>
                            <div className="mt-4">
                              <FeedbackComponent
                                queryId={conv.id}
                                agentId={agent?.id}
                              />
                            </div>
                          </div>
                        )}
                        {index === conversations.length - 1 && loadingQuery && !conv.answer && (
                          <div className="flex justify-center my-4">
                            <LoadingSpinner />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {error && (
                  <div className="text-red-500 my-4">
                    {error === "Échec de la réponse. Veuillez réessayer." 
                      ? "Échec de la réponse. Veuillez réessayer."
                      : error}
                  </div>
                )}
              </div>
            </div>

            {/* Share buttons for the latest response */}
            {conversations.length > 0 && conversations[conversations.length - 1].answer && (
              <ShareButtons
                question={conversations[conversations.length - 1].question}
                response={conversations[conversations.length - 1].answer}
                queryId={conversations[conversations.length - 1].id}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleAgentPage; 