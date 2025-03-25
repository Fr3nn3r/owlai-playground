from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_query_agent():
    payload = {"question": "What is Article 1382?", "agent_id": "agent1"}
    response = client.post("/query", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["agent_id"] == "agent1"
    assert data["question"] == "What is Article 1382?"
    assert "answer" in data
