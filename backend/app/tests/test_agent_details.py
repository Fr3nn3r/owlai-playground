from fastapi.testclient import TestClient
import pytest
from ..main import app
from ..data.agents import get_all_agents

client = TestClient(app)


def test_agent_data_structure():
    """Test that each agent has the required new fields"""
    agents = get_all_agents()
    required_fields = {
        "id",
        "name",
        "description",
        "welcome_title",
        "owl_image_url",
        "color_theme",
        "default_queries",
    }

    for agent in agents:
        assert all(
            field in agent for field in required_fields
        ), f"Agent {agent['id']} missing required fields"
        assert isinstance(
            agent["default_queries"], list
        ), f"default_queries for agent {agent['id']} must be a list"
        assert (
            len(agent["default_queries"]) > 0
        ), f"Agent {agent['id']} should have at least one default query"
        assert isinstance(
            agent["color_theme"], dict
        ), f"color_theme for agent {agent['id']} must be a dictionary"
        assert all(
            key in agent["color_theme"] for key in ["primary", "secondary"]
        ), f"color_theme for agent {agent['id']} must have primary and secondary colors"


def test_get_agent_details():
    """Test the agent details endpoint"""
    # Get list of all agents first
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()

    # Test details for each agent
    for agent in agents:
        response = client.get(f"/agents/{agent['id']}/details")
        assert response.status_code == 200
        details = response.json()

        # Verify all required fields are present
        assert "welcome_title" in details
        assert "owl_image_url" in details
        assert "color_theme" in details
        assert isinstance(details["color_theme"], dict)
        assert "default_queries" in details
        assert isinstance(details["default_queries"], list)


def test_get_default_queries():
    """Test the default queries endpoint"""
    # Get list of all agents first
    response = client.get("/agents")
    assert response.status_code == 200
    agents = response.json()

    # Test default queries for each agent
    for agent in agents:
        response = client.get(f"/agents/{agent['id']}/default-queries?format=simple")
        assert response.status_code == 200
        queries = response.json()

        assert isinstance(queries, list)
        assert len(queries) > 0
        for query in queries:
            assert isinstance(query, str)
            assert len(query) > 0


def test_invalid_agent_id():
    """Test endpoints with invalid agent ID"""
    response = client.get("/agents/nonexistent/details")
    assert response.status_code == 404

    response = client.get("/agents/nonexistent/default-queries")
    assert response.status_code == 404
