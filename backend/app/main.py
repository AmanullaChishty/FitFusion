from fastapi import FastAPI
from app.api.v1 import workouts
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Fitness Tracker",
    version="0.1.0",
    description="Backend API for fitness tracker app"
)

origins = [
    "http://localhost:5173",  # Vite frontend
    "https://*.app.github.dev",  # ✅ allow Codespaces frontend
]

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the AI Fitness Tracker API 🚀"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

# Include routers
app.include_router(workouts.router, prefix="/api/v1/workouts", tags=["workouts"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # only Codespaces domains
    allow_origin_regex="https://.*\.app\.github\.dev",  # safer: regex allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
