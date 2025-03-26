from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .data.agents import get_all_agents
from typing import List, Dict
import logging
from pydantic import BaseModel
import asyncio
import json

# from owlai.edwige import AgentManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS middleware with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)


# Add middleware to log requests
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Request from origin: {request.headers.get('origin')}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response


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
