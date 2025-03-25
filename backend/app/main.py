from fastapi import FastAPI

app = FastAPI()


@app.get("/agents")
def list_agents():
    return [{"id": "agent1", "name": "French Law Agent Alpha"}]


@app.post("/query")
def query_agent(question: str, agent_id: str):
    return {"answer": f"Mock answer to '{question}' from {agent_id}"}
