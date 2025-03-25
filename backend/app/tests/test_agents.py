from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_list_agents():
    response = client.get("/agents")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert "id" in data[0]
    assert "name" in data[0]
    assert "description" in data[0]
