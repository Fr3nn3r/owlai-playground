from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .data.agents import get_all_agents
import logging
from owlai.edwige import AgentManager

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
    agent_manager = AgentManager()
    logger.info("AgentManager initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize AgentManager: {str(e)}")
    agent_manager = None


@app.get("/agents")
def list_agents():
    return get_all_agents()


from pydantic import BaseModel


class QueryRequest(BaseModel):
    question: str
    agent_id: str


@app.post("/query")
def query_agent(payload: QueryRequest):
    return {
        "agent_id": payload.agent_id,
        "question": payload.question,
        "answer": f"This is a mock answer to: '{payload.question}' from agent '{payload.agent_id}'.",
    }
