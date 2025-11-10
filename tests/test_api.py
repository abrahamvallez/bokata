"""API endpoint tests"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)


def test_root():
    """Test root endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "running"
    assert "version" in data


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_analyze_project_validation():
    """Test project analysis input validation"""
    # Missing content
    response = client.post("/api/analyze/project", json={})
    assert response.status_code == 422

    # Content too short
    response = client.post("/api/analyze/project", json={"content": "short"})
    assert response.status_code == 422

    # Invalid output format
    response = client.post(
        "/api/analyze/project",
        json={"content": "Valid project description here", "output_format": "invalid"}
    )
    assert response.status_code == 422


def test_analyze_feature_validation():
    """Test feature analysis input validation"""
    # Missing content
    response = client.post("/api/analyze/feature", json={})
    assert response.status_code == 422

    # Content too short
    response = client.post("/api/analyze/feature", json={"content": "short"})
    assert response.status_code == 422


@pytest.mark.skip(reason="Requires Anthropic API key and takes time")
def test_analyze_project_integration():
    """Integration test for project analysis (requires API key)"""
    response = client.post(
        "/api/analyze/project",
        json={
            "content": """Project: Simple Todo App

Features:
- User Creates Task
- User Views Tasks
- User Completes Task

Tech Stack: React, Node.js, SQLite
Timeline: 2 weeks""",
            "output_format": "json"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "executive_summary" in data
    assert "features" in data
    assert "walking_skeleton" in data


@pytest.mark.skip(reason="Requires Anthropic API key and takes time")
def test_analyze_feature_integration():
    """Integration test for feature analysis (requires API key)"""
    response = client.post(
        "/api/analyze/feature",
        json={
            "content": """Feature: User Login

Description: Users can log in with email and password
Context: Web application, basic security
Tech Stack: React, Node.js, PostgreSQL""",
            "output_format": "json"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "features" in data
    assert len(data["features"]) >= 1
    assert "walking_skeleton" in data
