from fastapi import FastAPI
from app.api import auth, workouts, meals, progress
from app.core.config import settings

app = FastAPI(title="AI Fitness Tracker")

# Register routers
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
app.include_router(meals.router, prefix="/meals", tags=["meals"])
app.include_router(progress.router, prefix="/progress", tags=["progress"])

@app.get("/")
def root():
    return {"message": "Welcome to FIT Fusion"}
