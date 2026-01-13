"""
MedTech AI Backend - API Tests
"""

import pytest
from httpx import AsyncClient


class TestHealthCheck:
    """Test health check endpoints."""
    
    @pytest.mark.asyncio
    async def test_root_endpoint(self, client: AsyncClient):
        """Test root endpoint returns API info."""
        response = await client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["status"] == "running"
    
    @pytest.mark.asyncio
    async def test_health_endpoint(self, client: AsyncClient):
        """Test health endpoint."""
        response = await client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    @pytest.mark.asyncio
    async def test_api_health_endpoint(self, client: AsyncClient):
        """Test API health endpoint."""
        response = await client.get("/api/v1/health")
        
        assert response.status_code == 200


class TestAuthEndpoints:
    """Test authentication endpoints."""
    
    @pytest.mark.asyncio
    async def test_verify_invalid_token(self, client: AsyncClient):
        """Test that invalid token returns 401."""
        response = await client.post(
            "/api/v1/auth/verify",
            json={"token": "invalid-token"},
        )
        
        assert response.status_code == 401
    
    @pytest.mark.asyncio
    async def test_me_requires_auth(self, client: AsyncClient):
        """Test that /me endpoint requires authentication."""
        response = await client.get("/api/v1/auth/me")
        
        assert response.status_code == 401


class TestAIEndpoints:
    """Test AI endpoints."""
    
    @pytest.mark.asyncio
    async def test_ai_health(self, client: AsyncClient):
        """Test AI health check."""
        # This should work without auth
        response = await client.get("/api/v1/ai/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "gemini_available" in data
