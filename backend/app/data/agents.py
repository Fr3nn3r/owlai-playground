# app/data/agents.py

from typing import List, Dict


def get_all_agents() -> List[Dict]:
    return [
        {
            "id": "agent1",
            "name": "French Law Agent Alpha",
            "description": "Handles civil code queries.",
            "welcome_title": "Welcome to Civil Law Assistant",
            "owl_image_url": "/Nathalie.jpg",
            "color_theme": {"primary": "#2C3E50", "secondary": "#E74C3C"},
            "default_queries": [
                "Can you explain what constitutes a valid civil contract in French law?",
                "What are the basic property rights under French civil law?",
            ],
        },
        {
            "id": "agent2",
            "name": "French Law Agent Beta",
            "description": "Specialist in penal law.",
            "welcome_title": "Your Penal Law Expert",
            "owl_image_url": "/Marine.jpg",
            "color_theme": {"primary": "#34495E", "secondary": "#9B59B6"},
            "default_queries": [
                "What are the main elements of criminal liability in French law?",
                "What constitutes legitimate self-defense under French penal law?",
            ],
        },
        {
            "id": "agent3",
            "name": "French Law Agent Gamma",
            "description": "Focus on administrative law.",
            "welcome_title": "Administrative Law Guide",
            "owl_image_url": "/Marianne.jpg",
            "color_theme": {"primary": "#2980B9", "secondary": "#27AE60"},
            "default_queries": [
                "What is the process for filing an administrative appeal?",
                "What are the principles of public service in French administrative law?",
            ],
        },
    ]
