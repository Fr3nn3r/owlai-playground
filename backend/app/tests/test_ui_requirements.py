from fastapi.testclient import TestClient
import pytest
from ..main import app

client = TestClient(app)


def test_agent_selection_response():
    """Test that agent selection returns all required UI elements"""
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()

    for agent in agents:
        # Test UI-specific fields
        assert "color_theme" in agent
        assert isinstance(agent["color_theme"], dict)
        assert "primary" in agent["color_theme"]
        assert "secondary" in agent["color_theme"]
        assert "owl_image_url" in agent
        assert agent["owl_image_url"].startswith("http")  # Ensure it's a valid URL
        assert "welcome_title" in agent
        assert len(agent["welcome_title"]) > 0


def test_default_queries_format():
    """Test that default queries are properly formatted"""
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()

    for agent in agents:
        response = client.get(f"/agents/{agent['id']}/default-queries")
        assert response.status_code == 200
        queries = response.json()

        assert isinstance(queries, list)
        for query in queries:
            assert isinstance(query, str)
            assert len(query) > 0


def test_query_submission():
    """Test that submitting a default query works the same as a manual query"""
    # Get an agent and its default queries
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()
    agent = agents[0]

    response = client.get(f"/agents/{agent['id']}/default-queries")
    assert response.status_code == 200
    default_queries = response.json()

    # Test submitting a default query
    default_query = default_queries[0]
    response = client.post(
        "/query", json={"agent_id": agent["id"], "question": default_query}
    )
    assert response.status_code == 200
    assert "answer" in response.json()

    # Test submitting the same query as if typed manually
    response = client.post(
        "/query", json={"agent_id": agent["id"], "question": default_query}
    )
    assert response.status_code == 200
    assert "answer" in response.json()
