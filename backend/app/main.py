# backend/app/main.py
import os
from typing import List
from fastapi import FastAPI
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
# from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import (
    workouts,
    recommendations,
    auth,
    profile,
    meals,
    nutrition,
    progress,
    ai_routes,
)

app = FastAPI(
    title="AI Fit Fusion",
    version="0.1.0",
    description="Backend API for Fit Fusion app",
)

# Root + health endpoints (unchanged)
@app.get("/")
def root():
    return {"message": "Welcome to the AI Fit Fusion API 🚀"}

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

# Routers
app.include_router(workouts.router, prefix="/api", tags=["workouts"])
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(meals.router, prefix="/api", tags=["meals"])
app.include_router(nutrition.router, prefix="/api", tags=["nutrition"])
app.include_router(progress.router, prefix="/api", tags=["progress"])
app.include_router(ai_routes.router, prefix="/api", tags=["AI Recommender"])

# ----- CORS configuration (env-driven) -----
# Default/dev origins (keep localhost & vite)
default_origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite dev
    "https://*.app.github.dev",
]


frontend_env = os.getenv("FRONTEND_ORIGINS", "")
frontend_origins: List[str] = [s.strip() for s in frontend_env.split(",") if s.strip()]

# Optionally allow Codespaces domains with regex (only enable if you actively use it)
ENABLE_CODESPACES = os.getenv("ENABLE_CODESPACES", "0") == "1"
codespaces_regex = r"https://.*\.app\.github\.dev"

allow_origins = default_origins + frontend_origins
allow_origins.update([s.strip() for s in os.getenv("FRONTEND_ORIGINS","").split(",") if s.strip()])

# Configure CORSMiddleware
# If you need regex-based allow for Codespaces, pass allow_origin_regex (FastAPI/Starlette supports both).
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=allow_origins,              # explicit origins (preferred)
#     allow_origin_regex=(codespaces_regex if ENABLE_CODESPACES else None),
#     allow_credentials=True,                   # required if sending cookies or credentials
#     allow_methods=["*"],
#     allow_headers=["*"],                      # or explicitly ["Authorization","Content-Type"]
# )
# --------------------------------------------
class DynamicCORSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        # handle preflight
        if request.method == "OPTIONS":
            if origin and origin in allowed:
                headers = {
                    "Access-Control-Allow-Origin": origin,
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Headers": "Authorization,Content-Type",
                    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
                }
                return Response(status_code=200, headers=headers)
            return Response(status_code=400, content="CORS origin not allowed")
        resp = await call_next(request)
        if origin and origin in allowed:
            resp.headers["Access-Control-Allow-Origin"] = origin
            resp.headers["Access-Control-Allow-Credentials"] = "true"
        return resp

app.add_middleware(DynamicCORSMiddleware)
