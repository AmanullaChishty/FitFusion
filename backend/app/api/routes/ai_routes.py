from fastapi import APIRouter
from app.ai.fitness_advisor import generate_ai_recommendations

router = APIRouter(prefix="/ai", tags=["ai"])

@router.get("/recommendations")
async def get_ai_recommendations():
    return await generate_ai_recommendations()
