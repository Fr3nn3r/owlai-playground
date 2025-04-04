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
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  
  const chatEndRef = useRef(null);
  const latestConversationRef = useRef(null);

  const { API_URL } = config;

  // Generate new session ID on mount or page refresh
  useEffect(() => {
    const generateSessionId = () => {
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `session-${timestamp}-${randomStr}`;
    };

    setCurrentSessionId(generateSessionId());
    console.log('🔄 New conversation session started');
  }, []); // Empty dependency array means this runs once on mount

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

  // Scroll to the latest conversation when it's added
  useEffect(() => {
    if (latestConversationRef.current) {
      const yOffset = -100; // Offset to account for the fixed header
      const element = latestConversationRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      });
    }
  }, [conversations.length]); // Only run when new conversations are added

  // Scroll to follow the streaming response
  useEffect(() => {
    if (latestConversationRef.current && loadingQuery) {
      const headerOffset = 100; // Account for any fixed headers
      const element = latestConversationRef.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [response, loadingQuery]); // Run when response updates during streaming

  const fetchChunks = async (queryId) => {
    setLoadingChunks(true);
    setChunks([]); // Clear existing chunks immediately
    try {
      const response = await fetch(`${API_URL}/query/${queryId}/chunks`);
      if (!response.ok) throw new Error('Failed to fetch chunks');
      const data = await response.json();
      setChunks(data);
      setSelectedConversationId(queryId);
    } catch (err) {
      console.error('Error fetching chunks:', err);
      setChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim() || !currentSessionId) return;
    
    console.log('🚀 Starting submission with question:', question);
    console.log('📍 Current session:', currentSessionId);
    setLoadingQuery(true);
    setError("");
    setIsTyping(true);
    setResponse("");
    setChunks([]); // Reset chunks for new query
    
    try {
      const queryId = `${currentSessionId}-${Date.now()}`;
      const currentQuestion = question;
      
      // Add user message to conversation
      setConversations(prev => {
        const newConv = [...prev, {
          id: queryId,
          sessionId: currentSessionId,
          question: currentQuestion,
          answer: "",
          timestamp: new Date().toISOString(),
        }];
        console.log('💬 Current conversations:', newConv);
        return newConv;
      });

      // Set the new conversation as selected immediately
      setSelectedConversationId(queryId);

      // Initial scroll to the new conversation
      setTimeout(() => {
        if (latestConversationRef.current) {
          const headerOffset = 100; // Account for any fixed headers
          const element = latestConversationRef.current;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);

      console.log('🌐 Making API request to:', `${API_URL}/stream-query`);
      const response = await fetch(`${API_URL}/stream-query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          agent_id: agent.id,
          query_id: queryId,
          session_id: currentSessionId
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
      
      // After receiving the response, fetch the chunks
      await fetchChunks(queryId);

    } catch (err) {
      console.error("❌ Error during submission:", err);
      setError("Échec de la réponse. Veuillez réessayer.");
      setChunks([]); // Clear chunks on error
      
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
      <div className="container mx-auto px-4 py-8 relative z-10 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left panel - Suggested queries */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="fixed w-[calc((100vw-4rem)/12*3-1rem)] bg-blue-100/95 rounded-lg shadow-sm p-6 overflow-hidden" style={{ height: 'calc(100vh - 2rem)' }}>
              <DefaultQueries
                queries={defaultQueries}
                onQuerySelect={query => setQuestion(query)}
                selectedAgent={agent}
              />
            </div>
          </div>

          {/* Main content area - center */}
          <div className="lg:col-span-6 lg:col-start-4">
            <div className="bg-white/70 hover:bg-white/90 rounded-lg shadow-sm p-6 mb-6 transition-all duration-200">
              <div className="relative z-10">
                <h1 className="text-2xl font-bold mb-4">{agent?.welcome_title || "Chargement..."}</h1>
                <p className="text-gray-600 mb-6">{agent?.description}</p>

                {/* Current conversation */}
                <div className="mt-6 space-y-4">
                  {conversations.length > 0 && (
                    console.log('🎯 Rendering conversations:', conversations),
                    conversations.map((conv, index) => (
                      <div 
                        key={conv.id} 
                        className={`p-4 rounded-lg mb-6 bg-white/70 hover:bg-white/90 ${
                          !loadingQuery ? 'cursor-pointer' : ''
                        } transition-all duration-200 ${
                          selectedConversationId === conv.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        ref={index === conversations.length - 1 ? latestConversationRef : null}
                        onClick={() => {
                          if (!loadingQuery && conv.id !== selectedConversationId) {
                            fetchChunks(conv.id);
                          }
                        }}
                      >
                        <div className="font-medium mb-2 text-sm">
                          <span className="text-gray-800">Question: </span>
                          <span className="text-gray-600">{conv.question}</span>
                        </div>
                        <div className="text-gray-800 text-sm">
                          {conv.answer ? (
                            <>
                              <span className="font-medium">Réponse: </span>
                              <span className="whitespace-pre-wrap">{conv.answer}</span>
                            </>
                          ) : (
                            <div className="flex items-center gap-2">
                              <LoadingSpinner />
                              <span>En attente de réponse...</span>
                            </div>
                          )}
                        </div>
                        {conv.answer && (
                          <div className="mt-4">
                            <FeedbackComponent
                              queryId={conv.id}
                              agentId={agent?.id}
                            />
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
          </div>

          {/* Right panel - Document chunks */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="fixed w-[calc((100vw-4rem)/12*3-1rem)] bg-red-100/95 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                Extraits de loi
                {selectedConversationId && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    pour la question sélectionnée
                  </span>
                )}
              </h2>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                {loadingChunks ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : chunks.length > 0 ? (
                  <div className="space-y-4">
                    {chunks.map((chunk, index) => (
                      <div 
                        key={chunk.id} 
                        className="chunk-container p-4 rounded-lg bg-white/80 border border-gray-200 transition-all duration-200"
                        data-chunk-id={chunk.id}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs text-gray-600">
                            {chunk.source}
                          </div>
                          <button
                            onClick={(e) => {
                              const contentWrapper = e.target.closest('.chunk-container').querySelector('.content-wrapper');
                              const isExpanded = contentWrapper.classList.contains('h-auto');
                              
                              contentWrapper.style.maxHeight = isExpanded ? '6rem' : `${contentWrapper.scrollHeight}px`;
                              contentWrapper.classList.toggle('h-24');
                              contentWrapper.classList.toggle('h-auto');
                              e.target.textContent = isExpanded ? 'Voir plus' : 'Voir moins';
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2"
                          >
                            Voir plus
                          </button>
                        </div>
                        <div 
                          className="content-wrapper h-24 overflow-hidden transition-all duration-300 ease-in-out"
                        >
                          <p className="text-xs text-gray-800 italic">
                            {chunk.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Always render ShareButtons */}
      <ShareButtons />

      {/* Floating input area */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="py-4 bg-gradient-to-t from-gray-50 to-transparent">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto lg:col-start-4 lg:col-span-6">
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <QuestionInput
                    value={question}
                    onChange={setQuestion}
                    onSubmit={handleSubmit}
                    placeholder="Posez votre question..."
                    disabled={loadingQuery}
                    style={{
                      backgroundColor: 'white',
                      borderColor: '#E5E7EB',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loadingQuery || !question.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap h-[60px] flex items-center justify-center gap-2"
                >
                  {loadingQuery ? (
                    <>
                      <LoadingSpinner />
                      <span>Thinking...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      <span>Ask Question</span>
                    </>
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

export default SingleAgentPage; 