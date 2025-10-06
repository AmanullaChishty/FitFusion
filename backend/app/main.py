from fastapi import FastAPI
from app.api.routes import workouts,recommendations,auth,profile,meals,nutrition,progress
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Fit Fusion",
    version="0.1.0",
    description="Backend API for Fit Fusion app"
)

origins = [
    "http://localhost:3000",
    "http://localhost:5173",  # Vite frontend
    "https://*.app.github.dev",  # ✅ allow Codespaces frontend
]

# Root endpoint
@app.get("/")
def root():
    return {"message": "Welcome to the AI Fit Fusion API 🚀"}

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Backend is running!"}

# Include routers
app.include_router(workouts.router, prefix="/api", tags=["workouts"])
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])
app.include_router(auth.router, prefix="/api", tags=["auth"])
app.include_router(profile.router, prefix="/api", tags=["profile"])
app.include_router(meals.router, prefix="/api", tags=["meals"])
app.include_router(nutrition.router, prefix="/api", tags=["nutrition"])
app.include_router(progress.router, prefix="/api", tags=["progress"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,          # only Codespaces domains
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # safer: regex allow
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
