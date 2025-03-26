from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .data.agents import get_all_agents
from typing import List, Dict
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
