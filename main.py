"""FastAPI main application"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import router

# Load environment variables
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events"""
    # Startup
    print("🚀 Bokata API starting...")
    print(f"📊 Model: {os.getenv('MODEL_NAME', 'claude-3-5-sonnet-20241022')}")
    print(f"🌡️  Temperature: {os.getenv('TEMPERATURE', '0.7')}")
    yield
    # Shutdown
    print("👋 Bokata API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Bokata API",
    description="FastAPI + PocketFlow backend for Bokata Slicer CC",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include router
app.include_router(router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", "8000")),
        reload=os.getenv("API_RELOAD", "true").lower() == "true",
    )
