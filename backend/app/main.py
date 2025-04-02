from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .data.agents import get_all_agents
from typing import List, Dict, Optional
import logging
from pydantic import BaseModel
import asyncio
import json

# from owlai.edwige import AgentManager

# Configure logging with more detail
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS middleware with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://owlai-playground.vercel.app", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Add middleware to log requests with more detail
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request received: {request.method} {request.url}")
    logger.info(f"Request headers: {dict(request.headers)}")
    logger.info(f"Request from origin: {request.headers.get('origin')}")

    try:
        response = await call_next(request)
        logger.info(f"Response status: {response.status_code}")
        logger.info(f"Response headers: {dict(response.headers)}")

        # Add CORS headers explicitly for the production origin
        if request.headers.get("origin") == "https://owlai-playground.vercel.app":
            response.headers["Access-Control-Allow-Origin"] = (
                "https://owlai-playground.vercel.app"
            )
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "*"
            response.headers["Access-Control-Max-Age"] = "3600"

        return response
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        raise


# Add specific error handler for CORS preflight
@app.options("/{full_path:path}")
async def options_handler(request):
    logger.info(f"OPTIONS request received for path: {request.url.path}")
    logger.info(f"OPTIONS headers: {dict(request.headers)}")

    origin = request.headers.get("origin")
    if origin == "https://owlai-playground.vercel.app":
        return Response(
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "https://owlai-playground.vercel.app",
                "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Max-Age": "3600",
            },
        )
    return Response(status_code=403)


# Initialize AgentManager
try:
    agent_manager = None
    # logger.info("AgentManager initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize AgentManager: {str(e)}")
    agent_manager = None


class ColorTheme(BaseModel):
    primary: str
    secondary: str


class AgentDetails(BaseModel):
    id: str
    name: str
    description: str
    welcome_title: str
    owl_image_url: str
    color_theme: ColorTheme
    default_queries: List[str]


class QueryRequest(BaseModel):
    question: str
    agent_id: str


@app.get("/agents")
def list_agents():
    return get_all_agents()


@app.get("/agents/{agent_id}/details", response_model=AgentDetails)
def get_agent_details(agent_id: str):
    agents = get_all_agents()
    agent = next((a for a in agents if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@app.get("/agents/{agent_id}/default-queries", response_model=List[str])
def get_default_queries(agent_id: str) -> List[str]:
    agents = get_all_agents()
    agent = next((a for a in agents if a["id"] == agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent["default_queries"]


@app.post("/query")
def query_agent(payload: QueryRequest):
    # Verify agent exists
    agents = get_all_agents()
    agent = next((a for a in agents if a["id"] == payload.agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    return {
        "agent_id": payload.agent_id,
        "question": payload.question,
        "answer": f"This is a mock answer to: '{payload.question}' from agent '{payload.agent_id}'.",
    }


@app.post("/stream-query")
async def stream_query(payload: QueryRequest):
    # Verify agent exists
    agents = get_all_agents()
    agent = next((a for a in agents if a["id"] == payload.agent_id), None)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    async def generate():
        # Simulate streaming response with multiple chunks
        chunks = [
            f"Processing your questionnnnn: '{payload.question}'...\n",
            "Analyzing the context...\n",
            "Generating response...\n",
            f"This is a mock streaming answer from agent '{payload.agent_id}'.\n",
            "Finalizing response...\n",
        ]

        for chunk in chunks:
            # Convert chunk to JSON format with SSE structure
            yield f"data: {json.dumps({'content': chunk})}\n\n"
            # Simulate processing time
            await asyncio.sleep(1)

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# Additional models for new features
class FeedbackRequest(BaseModel):
    query_id: str
    agent_id: str
    rating: int
    comment: Optional[str] = None


class ContactFormRequest(BaseModel):
    name: str
    email: str
    message: str


class DocumentChunk(BaseModel):
    id: str
    content: str
    relevance_score: float
    source: str


# New endpoints for single agent page
@app.get("/default-agent")
def get_default_agent():
    """Get the default agent for the single-agent page."""
    agents = get_all_agents()
    if not agents:
        raise HTTPException(status_code=404, detail="No agents available")
    return agents[0]


# Feedback system endpoints
@app.post("/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """
    Submit feedback for a query response.
    Rating should be between 1 and 5.
    """
    if not 1 <= feedback.rating <= 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # In a real implementation, this would store the feedback in a database
    # For now, we'll just log it
    print(f"Received feedback: {feedback.dict()}")

    return {"status": "success", "message": "Feedback received"}


@app.post("/contact")
async def submit_contact_form(contact: ContactFormRequest):
    """Submit contact form feedback."""
    logger.info(f"Received contact form submission from {contact.email}")
    return {"status": "success", "message": "Contact form submitted"}


# Document chunks visualization endpoint
@app.get("/query/{query_id}/chunks")
async def get_query_chunks(query_id: str):
    """Get document chunks used to answer a specific query."""
    # Mock response with sample chunks
    chunks = [
        DocumentChunk(
            id="1",
            content="This is a relevant document chunk...",
            relevance_score=0.95,
            source="document1.pdf",
        ),
        DocumentChunk(
            id="2",
            content="Another relevant piece of information...",
            relevance_score=0.85,
            source="document2.pdf",
        ),
    ]
    return chunks


# Enhanced logging endpoint
@app.get("/query/{query_id}/logs")
async def get_query_logs(query_id: str):
    """Get detailed logs for a specific query (for development purposes)."""
    # Mock response with sample logs
    logs = {
        "query_id": query_id,
        "timestamp": "2024-04-02T10:00:00Z",
        "processing_time": 1.5,
        "llm_interactions": [
            {
                "timestamp": "2024-04-02T10:00:00Z",
                "type": "prompt",
                "content": "Sample prompt content",
            },
            {
                "timestamp": "2024-04-02T10:00:01Z",
                "type": "response",
                "content": "Sample response content",
            },
        ],
        "tool_invocations": [
            {
                "timestamp": "2024-04-02T10:00:00.5Z",
                "tool": "document_search",
                "parameters": {"query": "sample search"},
                "result": "sample result",
            }
        ],
    }
    return logs


# Version endpoint
@app.get("/version")
async def get_version():
    """Get the current version of OwlAI."""
    return {"version": "0.2.0"}


@app.get("/feedback/all")
async def get_all_feedback():
    """Get all feedback entries with associated query information."""
    # Mock feedback data for demonstration
    mock_feedback = [
        {
            "query_id": "agent1-1",
            "agent_id": "agent1",
            "rating": 5,
            "comment": "Very helpful and accurate response!",
            "timestamp": "2024-04-02T10:00:00Z",
            "query": "Can you explain what constitutes a valid civil contract in French law?",
            "response": "A valid civil contract in French law requires four essential elements: consent (consentement), capacity (capacité), a defined object (objet), and a lawful cause (cause licite). The parties must give their free and informed consent, be legally capable of entering into contracts, agree on a specific and legal purpose, and have a legitimate reason for the contract. Additionally, certain contracts may require specific formalities, such as being in writing or notarized.",
        },
        {
            "query_id": "agent2-1",
            "agent_id": "agent2",
            "rating": 2,
            "comment": "The response was a bit confusing and could be more detailed.",
            "timestamp": "2024-04-02T09:45:00Z",
            "query": "What are the main elements of criminal liability in French law?",
            "response": "Criminal liability in French law involves several elements. There needs to be a legal text defining the offense, and the person must have committed the act intentionally or through negligence.",
        },
        {
            "query_id": "agent1-2",
            "agent_id": "agent1",
            "rating": 4,
            "timestamp": "2024-04-02T09:30:00Z",
            "query": "What are the basic property rights under French civil law?",
            "response": "Under French civil law, property rights (droits réels) include: the right to use (usus), the right to enjoy benefits (fructus), and the right to dispose of property (abusus). These rights are protected by the Civil Code and can only be limited by law or contract. Property owners have extensive rights but must exercise them within legal boundaries and respect neighbors' rights.",
        },
        {
            "query_id": "agent3-1",
            "agent_id": "agent3",
            "rating": 5,
            "comment": "Perfect explanation, exactly what I needed!",
            "timestamp": "2024-04-02T09:15:00Z",
            "query": "What is the process for filing an administrative appeal?",
            "response": "To file an administrative appeal in France, you must first identify whether you need a recours gracieux (appeal to the same authority) or recours hiérarchique (appeal to a higher authority). The appeal must be filed within 2 months of the decision. Include all relevant documents, clearly state your arguments, and keep proof of submission. The administration then has 2 months to respond, and silence is considered a rejection.",
        },
        {
            "query_id": "agent2-2",
            "agent_id": "agent2",
            "rating": 1,
            "comment": "The answer was not relevant to my question.",
            "timestamp": "2024-04-02T09:00:00Z",
            "query": "What constitutes legitimate self-defense under French penal law?",
            "response": "Self-defense in French law requires proportionality between the threat and the response. The danger must be immediate and the response necessary.",
        },
    ]
    return mock_feedback
