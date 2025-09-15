from fastapi import FastAPI
from app.api.v1 import workouts

app = FastAPI(
    title="AI Fitness Tracker",
    version="0.1.0",
    description="Backend API for fitness tracker app"
)

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
