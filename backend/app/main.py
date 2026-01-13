"""
MedTech AI Backend - Main Application

FastAPI application entry point with lifespan management.
"""

import logging
import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.session import init_db, close_db
from app.api.routes import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Static files directory (built React app)
STATIC_DIR = Path(__file__).parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("Starting MedTech AI Backend...")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    
    # Initialize database
    await init_db()
    logger.info("Database connection established")
    
    # Initialize AI services
    from app.services.ai.gemini_client import gemini_client
    if gemini_client.is_available:
        logger.info(f"Gemini AI initialized: {settings.gemini_model}")
    else:
        logger.warning("Gemini AI not available - check API key")
    
    yield
    
    # Shutdown
    logger.info("Shutting down MedTech AI Backend...")
    await close_db()
    logger.info("Database connection closed")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="""
    MedTech AI - Smart Hospital Assistant API
    
    A production-grade healthcare backend with AI-powered features:
    
    - **AI Symptom Checking**: Analyze symptoms with safety-first approach
    - **Voice Chat**: Speech-to-text interaction for symptom description
    - **Emergency SOS**: Trigger and manage emergency events
    - **Appointment Booking**: Schedule and manage doctor appointments
    - **Health Vitals**: Track and monitor health metrics
    
    ## Authentication
    
    This API uses Supabase JWT tokens for authentication.
    Include the token in the Authorization header:
    
    ```
    Authorization: Bearer <your-supabase-jwt>
    ```
    
    ## Safety Notice
    
    The AI features are for informational purposes only and do not constitute
    medical advice. Always consult a healthcare professional for medical decisions.
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors with clear messages."""
    errors = []
    for error in exc.errors():
        loc = " -> ".join(str(l) for l in error["loc"])
        errors.append({
            "field": loc,
            "message": error["msg"],
            "type": error["type"],
        })
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation error",
            "errors": errors,
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected errors."""
    logger.exception(f"Unexpected error: {exc}")
    
    if settings.debug:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": str(exc),
                "type": type(exc).__name__,
            },
        )
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"},
    )


# Include API router
app.include_router(api_router)


# API info endpoint (for debugging/verification)
@app.get("/api")
async def api_root():
    """API root endpoint with information."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs" if settings.debug else "Disabled in production",
    }


# Health check endpoint (outside API router for load balancer access)
@app.get("/health")
async def health():
    """Health check for load balancers and monitoring."""
    return {
        "status": "healthy",
        "environment": settings.environment,
    }


# ============================================
# Static File Serving (React Frontend)
# ============================================

# Serve static assets (JS, CSS, images) if they exist
if STATIC_DIR.exists():
    # Mount assets directory for Vite build output
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Serve other static files
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")
    
    logger.info(f"Serving static files from: {STATIC_DIR}")


# Catch-all route for React SPA (must be last!)
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Serve React SPA for all non-API routes.
    
    This enables client-side routing for the React frontend.
    """
    # Don't serve index.html for API routes
    if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc"):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"detail": "Not found"}
        )
    
    # Check if it's a static file request
    static_file = STATIC_DIR / full_path
    if static_file.exists() and static_file.is_file():
        return FileResponse(static_file)
    
    # Serve index.html for SPA routing
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    
    # Fallback if no frontend build exists (development mode)
    return JSONResponse(
        content={
            "message": "MedTech AI API is running",
            "docs": "/docs" if settings.debug else "API docs disabled in production",
            "note": "Frontend not built. Run 'npm run build' to build the frontend."
        }
    )


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
    )
