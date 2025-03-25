from fastapi import FastAPI
from app.data.agents import get_all_agents

app = FastAPI()


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


from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this later to just your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
