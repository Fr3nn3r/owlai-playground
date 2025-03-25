from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .data.agents import get_all_agents
from typing import List, Dict
import logging
from pydantic import BaseModel

# from owlai.edwige import AgentManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specifically allow your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
